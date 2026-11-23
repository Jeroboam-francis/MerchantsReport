BEGIN
  pkg_merchant_analytics.generate_dummy_data(
    p_merchant_count => 40,
    p_profile_count => 100,
    p_transaction_count => 100000,
    p_detail_count => 10000,
    p_month_count => 24
  );
  pkg_merchant_analytics.refresh_analytics;
END;
/
