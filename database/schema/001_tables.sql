CREATE TABLE merchants (
  id NUMBER(12) NOT NULL,
  name VARCHAR2(200) NOT NULL,
  msisdn VARCHAR2(30) NOT NULL,
  user_id VARCHAR2(100),
  dob DATE,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  modified_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  status VARCHAR2(20) DEFAULT 'ACTIVE' NOT NULL,
  id_value VARCHAR2(100),
  kyc_id VARCHAR2(100),
  user_type VARCHAR2(30),
  category_id VARCHAR2(30),
  user_grade VARCHAR2(30),
  type VARCHAR2(30),
  active CHAR(1) DEFAULT 'Y' NOT NULL,
  segment VARCHAR2(20) DEFAULT 'medium' NOT NULL,
  CONSTRAINT pk_merchants PRIMARY KEY (id),
  CONSTRAINT uq_merchants_msisdn UNIQUE (msisdn),
  CONSTRAINT ck_merchants_active CHECK (active IN ('Y', 'N')),
  CONSTRAINT ck_merchants_status CHECK (status IN ('ACTIVE', 'DORMANT', 'SUSPENDED')),
  CONSTRAINT ck_merchants_segment CHECK (segment IN ('high', 'medium', 'dormant', 'new', 'growing', 'fraudulent'))
);

CREATE TABLE merchant_profiles (
  id NUMBER(12) NOT NULL,
  merchant_id NUMBER(12) NOT NULL,
  merchant_name VARCHAR2(200) NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  account_id VARCHAR2(40) NOT NULL,
  category_code VARCHAR2(30),
  service_type VARCHAR2(40),
  grade_code VARCHAR2(30),
  merchant_type VARCHAR2(30),
  CONSTRAINT pk_merchant_profiles PRIMARY KEY (id),
  CONSTRAINT uq_profiles_account UNIQUE (account_id),
  CONSTRAINT fk_profiles_merchant FOREIGN KEY (merchant_id) REFERENCES merchants (id)
);

CREATE TABLE merchant_transactions (
  id NUMBER(12) NOT NULL,
  merchant_id NUMBER(12) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant_name VARCHAR2(200) NOT NULL,
  msisdn VARCHAR2(30),
  category_code VARCHAR2(30),
  service_type VARCHAR2(40),
  grade_code VARCHAR2(30),
  second_party_category_code VARCHAR2(30),
  merchant_type VARCHAR2(30),
  total_amount NUMBER(18,2) DEFAULT 0 NOT NULL,
  txn_count NUMBER(10) DEFAULT 1 NOT NULL,
  distinct_recipients NUMBER(10) DEFAULT 1 NOT NULL,
  revenue NUMBER(18,2) DEFAULT 0 NOT NULL,
  tax NUMBER(18,2) DEFAULT 0 NOT NULL,
  transaction_status VARCHAR2(20) DEFAULT 'SUCCESS' NOT NULL,
  CONSTRAINT pk_merchant_transactions PRIMARY KEY (id),
  CONSTRAINT fk_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES merchants (id),
  CONSTRAINT ck_transaction_status CHECK (transaction_status IN ('SUCCESS', 'FAILED')),
  CONSTRAINT ck_transaction_amount CHECK (total_amount >= 0 AND revenue >= 0 AND tax >= 0)
);

CREATE TABLE transaction_details (
  id NUMBER(12) NOT NULL,
  merchant_id NUMBER(12) NOT NULL,
  transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transfer_id VARCHAR2(60) NOT NULL,
  merchant_name VARCHAR2(200) NOT NULL,
  account_id VARCHAR2(40),
  category_code VARCHAR2(30),
  service_type VARCHAR2(40),
  grade_code VARCHAR2(30),
  transfer_type VARCHAR2(30),
  error_code VARCHAR2(30),
  message VARCHAR2(500),
  merchant_type VARCHAR2(30),
  requested_amount NUMBER(18,2) DEFAULT 0 NOT NULL,
  second_party_account_id VARCHAR2(40),
  CONSTRAINT pk_transaction_details PRIMARY KEY (id),
  CONSTRAINT uq_transfer_id UNIQUE (transfer_id),
  CONSTRAINT fk_details_merchant FOREIGN KEY (merchant_id) REFERENCES merchants (id)
);

CREATE TABLE monthly_subscriber_summary (
  id NUMBER(12) NOT NULL,
  month DATE NOT NULL,
  merchant_id NUMBER(12) NOT NULL,
  merchant_name VARCHAR2(200) NOT NULL,
  account_id VARCHAR2(40),
  category_code VARCHAR2(30),
  service_type VARCHAR2(40),
  grade_code VARCHAR2(30),
  merchant_type VARCHAR2(30),
  unique_subscribers NUMBER(12) DEFAULT 0 NOT NULL,
  CONSTRAINT pk_monthly_subscribers PRIMARY KEY (id),
  CONSTRAINT uq_subscriber_month UNIQUE (merchant_id, month),
  CONSTRAINT fk_subscribers_merchant FOREIGN KEY (merchant_id) REFERENCES merchants (id),
  CONSTRAINT ck_subscribers_nonnegative CHECK (unique_subscribers >= 0)
);

CREATE TABLE app_roles (
  id NUMBER(8) NOT NULL,
  role_name VARCHAR2(60) NOT NULL,
  description VARCHAR2(300),
  CONSTRAINT pk_app_roles PRIMARY KEY (id),
  CONSTRAINT uq_app_roles_name UNIQUE (role_name)
);

CREATE TABLE app_permissions (
  id NUMBER(8) NOT NULL,
  permission_key VARCHAR2(100) NOT NULL,
  description VARCHAR2(300),
  CONSTRAINT pk_app_permissions PRIMARY KEY (id),
  CONSTRAINT uq_app_permissions_key UNIQUE (permission_key)
);

CREATE TABLE role_permissions (
  role_id NUMBER(8) NOT NULL,
  permission_id NUMBER(8) NOT NULL,
  CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES app_roles (id),
  CONSTRAINT fk_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES app_permissions (id)
);

CREATE TABLE app_users (
  id NUMBER(12) NOT NULL,
  email VARCHAR2(254) NOT NULL,
  password_hash VARCHAR2(200) NOT NULL,
  display_name VARCHAR2(150) NOT NULL,
  role_id NUMBER(8) NOT NULL,
  is_active CHAR(1) DEFAULT 'Y' NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  last_login_on TIMESTAMP WITH TIME ZONE,
  CONSTRAINT pk_app_users PRIMARY KEY (id),
  CONSTRAINT uq_app_users_email UNIQUE (email),
  CONSTRAINT fk_app_users_role FOREIGN KEY (role_id) REFERENCES app_roles (id),
  CONSTRAINT ck_app_users_active CHECK (is_active IN ('Y', 'N'))
);

CREATE TABLE refresh_tokens (
  id NUMBER(12) NOT NULL,
  user_id NUMBER(12) NOT NULL,
  token_hash VARCHAR2(200) NOT NULL,
  expires_on TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_on TIMESTAMP WITH TIME ZONE,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
  CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES app_users (id)
);

CREATE TABLE platform_alerts (
  id NUMBER(12) NOT NULL,
  alert_type VARCHAR2(40) NOT NULL,
  severity VARCHAR2(20) NOT NULL,
  merchant_id NUMBER(12),
  merchant_name VARCHAR2(200),
  message VARCHAR2(1000) NOT NULL,
  status VARCHAR2(20) DEFAULT 'OPEN' NOT NULL,
  created_on TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  acknowledged_by NUMBER(12),
  acknowledged_on TIMESTAMP WITH TIME ZONE,
  CONSTRAINT pk_platform_alerts PRIMARY KEY (id),
  CONSTRAINT fk_alerts_merchant FOREIGN KEY (merchant_id) REFERENCES merchants (id),
  CONSTRAINT fk_alerts_ack_user FOREIGN KEY (acknowledged_by) REFERENCES app_users (id),
  CONSTRAINT ck_alerts_severity CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT ck_alerts_status CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED'))
);

CREATE SEQUENCE seq_merchants START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE SEQUENCE seq_merchant_profiles START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE SEQUENCE seq_merchant_transactions START WITH 1 INCREMENT BY 1 CACHE 1000;
CREATE SEQUENCE seq_transaction_details START WITH 1 INCREMENT BY 1 CACHE 500;
CREATE SEQUENCE seq_monthly_subscribers START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE SEQUENCE seq_app_roles START WITH 1 INCREMENT BY 1 CACHE 20;
CREATE SEQUENCE seq_app_permissions START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE SEQUENCE seq_app_users START WITH 1 INCREMENT BY 1 CACHE 50;
CREATE SEQUENCE seq_refresh_tokens START WITH 1 INCREMENT BY 1 CACHE 100;
CREATE SEQUENCE seq_platform_alerts START WITH 1 INCREMENT BY 1 CACHE 100;
