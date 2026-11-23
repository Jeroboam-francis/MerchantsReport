CREATE OR REPLACE VIEW v_daily_merchant_revenue AS
SELECT TRUNC(CAST(transaction_date AS DATE)) AS revenue_day,
       merchant_id,
       merchant_name,
       SUM(revenue) AS total_revenue,
       SUM(total_amount) AS total_amount,
       SUM(txn_count) AS total_transactions,
       SUM(distinct_recipients) AS recipient_count
FROM merchant_transactions
WHERE transaction_status = 'SUCCESS'
GROUP BY TRUNC(CAST(transaction_date AS DATE)), merchant_id, merchant_name;

CREATE OR REPLACE VIEW v_monthly_subscriber_totals AS
SELECT TRUNC(month, 'MM') AS subscriber_month,
       SUM(unique_subscribers) AS unique_subscribers,
       COUNT(DISTINCT merchant_id) AS reporting_merchants
FROM monthly_subscriber_summary
GROUP BY TRUNC(month, 'MM');

CREATE MATERIALIZED VIEW mv_monthly_merchant_analytics
BUILD IMMEDIATE
REFRESH COMPLETE ON DEMAND
AS
SELECT TRUNC(CAST(t.transaction_date AS DATE), 'MM') AS analytics_month,
       t.merchant_id,
       m.name AS merchant_name,
       SUM(CASE WHEN t.transaction_status = 'SUCCESS' THEN t.revenue ELSE 0 END) AS revenue,
       SUM(CASE WHEN t.transaction_status = 'SUCCESS' THEN t.txn_count ELSE 0 END) AS transaction_count,
       SUM(CASE WHEN t.transaction_status = 'FAILED' THEN 1 ELSE 0 END) AS failed_transaction_count
FROM merchant_transactions t
JOIN merchants m ON m.id = t.merchant_id
GROUP BY TRUNC(CAST(t.transaction_date AS DATE), 'MM'), t.merchant_id, m.name;

CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT NVL((SELECT SUM(revenue) FROM merchant_transactions WHERE transaction_status = 'SUCCESS'), 0) AS total_revenue,
       NVL((SELECT ROUND(100 * (MAX(CASE WHEN month_rank = 1 THEN monthly_revenue END) - MAX(CASE WHEN month_rank = 2 THEN monthly_revenue END)) /
         NULLIF(MAX(CASE WHEN month_rank = 2 THEN monthly_revenue END), 0), 2)
         FROM (
           SELECT SUM(revenue) AS monthly_revenue,
                  DENSE_RANK() OVER (ORDER BY TRUNC(CAST(transaction_date AS DATE), 'MM') DESC) AS month_rank
           FROM merchant_transactions
           WHERE transaction_status = 'SUCCESS'
           GROUP BY TRUNC(CAST(transaction_date AS DATE), 'MM')
         )
         WHERE month_rank <= 2), 0) AS revenue_growth_percentage,
       NVL((SELECT SUM(txn_count) FROM merchant_transactions WHERE transaction_status = 'SUCCESS'), 0) AS total_transactions,
       NVL((SELECT ROUND(AVG(total_amount), 2) FROM merchant_transactions WHERE transaction_status = 'SUCCESS'), 0) AS average_ticket_size,
       (SELECT COUNT(*) FROM merchants WHERE active = 'Y' AND status = 'ACTIVE') AS active_merchants,
       (SELECT COUNT(*) FROM merchants WHERE status = 'DORMANT' OR active = 'N') AS dormant_merchants,
       NVL((SELECT SUM(unique_subscribers) FROM monthly_subscriber_summary WHERE month = (SELECT MAX(month) FROM monthly_subscriber_summary)), 0) AS subscriber_count,
       NVL((SELECT ROUND(100 * (MAX(CASE WHEN month_rank = 1 THEN subscriber_total END) - MAX(CASE WHEN month_rank = 2 THEN subscriber_total END)) /
         NULLIF(MAX(CASE WHEN month_rank = 2 THEN subscriber_total END), 0), 2)
         FROM (
           SELECT SUM(unique_subscribers) AS subscriber_total,
                  DENSE_RANK() OVER (ORDER BY TRUNC(month, 'MM') DESC) AS month_rank
           FROM monthly_subscriber_summary
           GROUP BY TRUNC(month, 'MM')
         )
         WHERE month_rank <= 2), 0) AS subscriber_growth_percentage
FROM dual;

CREATE OR REPLACE VIEW v_active_alerts AS
SELECT id, alert_type, severity, merchant_id, merchant_name, message, status, created_on
FROM platform_alerts
WHERE status <> 'RESOLVED';

CREATE OR REPLACE VIEW v_merchant_risk_summary AS
SELECT m.id AS merchant_id,
       m.name AS merchant_name,
       LEAST(100,
         CASE WHEN m.segment = 'fraudulent' THEN 40 ELSE 0 END +
         CASE WHEN NVL(x.failed_count, 0) / NULLIF(x.transaction_count, 0) >= 0.25 THEN 40
              WHEN NVL(x.failed_count, 0) / NULLIF(x.transaction_count, 0) >= 0.10 THEN 25 ELSE 0 END +
         CASE WHEN NVL(v.max_velocity, 0) >= 30 THEN 35 ELSE 0 END) AS risk_score,
       x.last_transaction_date AS last_transaction_date,
       CASE WHEN m.segment = 'fraudulent' THEN 'synthetic elevated-risk scenario'
            WHEN NVL(v.max_velocity, 0) >= 30 THEN 'high hourly transaction velocity'
            ELSE 'transaction pattern review' END AS indicators
FROM merchants m
LEFT JOIN (
  SELECT merchant_id,
         SUM(CASE WHEN transaction_date >= SYSTIMESTAMP - INTERVAL '30' DAY AND transaction_status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count,
         SUM(CASE WHEN transaction_date >= SYSTIMESTAMP - INTERVAL '30' DAY THEN 1 ELSE 0 END) AS transaction_count,
         MAX(transaction_date) AS last_transaction_date
  FROM merchant_transactions
  GROUP BY merchant_id
) x ON x.merchant_id = m.id
LEFT JOIN (
  SELECT merchant_id, MAX(hourly_count) AS max_velocity
  FROM (
    SELECT merchant_id,
           TRUNC(CAST(transaction_date AS DATE), 'HH24') AS hour_slot,
           COUNT(*) AS hourly_count
    FROM merchant_transactions
    WHERE transaction_date >= SYSTIMESTAMP - INTERVAL '30' DAY
    GROUP BY merchant_id, TRUNC(CAST(transaction_date AS DATE), 'HH24')
  )
  GROUP BY merchant_id
) v ON v.merchant_id = m.id;

CREATE OR REPLACE PACKAGE pkg_merchant_analytics AS
  PROCEDURE refresh_analytics;
  PROCEDURE generate_dummy_data(
    p_merchant_count IN PLS_INTEGER DEFAULT 50,
    p_profile_count IN PLS_INTEGER DEFAULT 100,
    p_transaction_count IN PLS_INTEGER DEFAULT 100000,
    p_detail_count IN PLS_INTEGER DEFAULT 10000,
    p_month_count IN PLS_INTEGER DEFAULT 24
  );
END pkg_merchant_analytics;
/

CREATE OR REPLACE PACKAGE BODY pkg_merchant_analytics AS
  PROCEDURE refresh_analytics IS
  BEGIN
    DBMS_MVIEW.REFRESH('MV_MONTHLY_MERCHANT_ANALYTICS', 'C');
  END refresh_analytics;

  PROCEDURE generate_dummy_data(
    p_merchant_count IN PLS_INTEGER DEFAULT 50,
    p_profile_count IN PLS_INTEGER DEFAULT 100,
    p_transaction_count IN PLS_INTEGER DEFAULT 100000,
    p_detail_count IN PLS_INTEGER DEFAULT 10000,
    p_month_count IN PLS_INTEGER DEFAULT 24
  ) IS
    TYPE t_ids IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    l_merchant_ids t_ids;
    l_categories SYS.ODCIVARCHAR2LIST := SYS.ODCIVARCHAR2LIST('GROCERY', 'FUEL', 'RETAIL', 'UTILITIES', 'DIGITAL');
    l_segments SYS.ODCIVARCHAR2LIST := SYS.ODCIVARCHAR2LIST('high', 'medium', 'dormant', 'new', 'growing', 'fraudulent');
    l_category VARCHAR2(30);
    l_segment VARCHAR2(20);
    l_name VARCHAR2(200);
    l_merchant_id NUMBER;
    l_amount NUMBER;
    l_month DATE;
  BEGIN
    IF p_merchant_count < 1 OR p_profile_count < p_merchant_count OR p_month_count < 1 THEN
      RAISE_APPLICATION_ERROR(-20001, 'Seed counts are invalid');
    END IF;
    FOR i IN 1 .. p_merchant_count LOOP
      l_category := l_categories(MOD(i - 1, l_categories.COUNT) + 1);
      l_segment := l_segments(MOD(i - 1, l_segments.COUNT) + 1);
      l_name := 'Demo Merchant ' || TO_CHAR(i, 'FM000');
      l_merchant_id := seq_merchants.NEXTVAL;
      l_merchant_ids(i) := l_merchant_id;
      INSERT INTO merchants (id, name, msisdn, user_id, created_on, modified_on, status, category_id, user_type, user_grade, type, active, segment)
      VALUES (l_merchant_id, l_name, '256700' || LPAD(i, 6, '0'), 'DEMO-' || i,
        CASE WHEN l_segment = 'new' THEN SYSTIMESTAMP - INTERVAL '60' DAY ELSE SYSTIMESTAMP - INTERVAL '2' YEAR END,
        SYSTIMESTAMP,
        CASE WHEN l_segment = 'dormant' THEN 'DORMANT' ELSE 'ACTIVE' END,
        l_category, 'BUSINESS', CASE WHEN l_segment = 'high' THEN 'A' ELSE 'B' END,
        'MERCHANT', CASE WHEN l_segment = 'dormant' THEN 'N' ELSE 'Y' END, l_segment);
    END LOOP;

    FOR i IN 1 .. p_profile_count LOOP
      l_merchant_id := l_merchant_ids(MOD(i - 1, p_merchant_count) + 1);
      SELECT name, category_id, type INTO l_name, l_category, l_segment FROM merchants WHERE id = l_merchant_id;
      INSERT INTO merchant_profiles (id, merchant_id, merchant_name, account_id, category_code, service_type, grade_code, merchant_type)
      VALUES (seq_merchant_profiles.NEXTVAL, l_merchant_id, l_name, 'DEMO-ACC-' || LPAD(i, 8, '0'), l_category, 'PAYMENT', 'B', l_segment);
    END LOOP;

    FOR i IN 1 .. p_transaction_count LOOP
      l_merchant_id := l_merchant_ids(MOD(i - 1, p_merchant_count) + 1);
      SELECT name, category_id, segment INTO l_name, l_category, l_segment FROM merchants WHERE id = l_merchant_id;
      l_amount := ROUND(DBMS_RANDOM.VALUE(500, 100000) * CASE WHEN l_segment = 'high' THEN 10 ELSE 1 END, 2);
      INSERT INTO merchant_transactions (
        id, merchant_id, transaction_date, merchant_name, category_code, service_type,
        merchant_type, total_amount, txn_count, distinct_recipients, revenue, tax, transaction_status
      ) VALUES (
        seq_merchant_transactions.NEXTVAL, l_merchant_id,
        SYSTIMESTAMP - NUMTODSINTERVAL(DBMS_RANDOM.VALUE(0, p_month_count * 30), 'DAY'),
        l_name, l_category, 'PAYMENT', 'BUSINESS', l_amount, 1,
        TRUNC(DBMS_RANDOM.VALUE(1, 5)), ROUND(l_amount * 0.018, 2), ROUND(l_amount * 0.001, 2),
        CASE WHEN l_segment = 'fraudulent' AND DBMS_RANDOM.VALUE < 0.16 THEN 'FAILED' ELSE 'SUCCESS' END
      );
      IF MOD(i, 10000) = 0 THEN COMMIT; END IF;
    END LOOP;

    FOR i IN 1 .. p_detail_count LOOP
      l_merchant_id := l_merchant_ids(MOD(i - 1, p_merchant_count) + 1);
      SELECT name INTO l_name FROM merchants WHERE id = l_merchant_id;
      INSERT INTO transaction_details (
        id, merchant_id, transfer_date, transfer_id, merchant_name, account_id,
        category_code, service_type, transfer_type, error_code, message, merchant_type,
        requested_amount, second_party_account_id
      ) VALUES (
        seq_transaction_details.NEXTVAL, l_merchant_id,
        SYSTIMESTAMP - NUMTODSINTERVAL(DBMS_RANDOM.VALUE(0, p_month_count * 30), 'DAY'),
        'DEMO-TXN-' || TO_CHAR(seq_transaction_details.CURRVAL, 'FM0000000000'),
        l_name, 'DEMO-ACC-' || LPAD(l_merchant_id, 8, '0'), 'RETAIL', 'PAYMENT',
        'MERCHANT_PAYMENT', CASE WHEN MOD(i, 20) = 0 THEN 'E100' END,
        CASE WHEN MOD(i, 20) = 0 THEN 'Synthetic failed transfer' ELSE 'Synthetic transfer' END,
        'BUSINESS', ROUND(DBMS_RANDOM.VALUE(500, 100000), 2), 'DEMO-REC-' || LPAD(i, 8, '0')
      );
    END LOOP;

    FOR merchant_index IN 1 .. p_merchant_count LOOP
      l_merchant_id := l_merchant_ids(merchant_index);
      SELECT name, category_id INTO l_name, l_category FROM merchants WHERE id = l_merchant_id;
      FOR month_index IN 0 .. p_month_count - 1 LOOP
        l_month := ADD_MONTHS(TRUNC(SYSDATE, 'MM'), month_index - p_month_count + 1);
        INSERT INTO monthly_subscriber_summary (
          id, month, merchant_id, merchant_name, account_id, category_code, service_type, merchant_type, unique_subscribers
        ) VALUES (
          seq_monthly_subscribers.NEXTVAL, l_month, l_merchant_id, l_name,
          'DEMO-ACC-' || LPAD(l_merchant_id, 8, '0'), l_category, 'PAYMENT', 'BUSINESS',
          TRUNC(DBMS_RANDOM.VALUE(100, 2000))
        );
      END LOOP;
    END LOOP;

    COMMIT;
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END generate_dummy_data;
END pkg_merchant_analytics;
/

CREATE OR REPLACE PROCEDURE refresh_merchant_analytics AS
BEGIN
  pkg_merchant_analytics.refresh_analytics;
END;
/
