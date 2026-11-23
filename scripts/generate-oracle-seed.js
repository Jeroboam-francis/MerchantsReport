const fs = require('node:fs');
const path = require('node:path');

const output = path.join(__dirname, '..', 'database', 'seeds', 'generated_seed.sql');
const content = `-- Generated Oracle seed runner. This script uses the schema package for efficient bulk generation.
-- Execute after database/schema/001_tables.sql through 004_security.sql.
SET SERVEROUTPUT ON
BEGIN
  pkg_merchant_analytics.generate_dummy_data(
    p_merchant_count => 50,
    p_profile_count => 100,
    p_transaction_count => 100000,
    p_detail_count => 10000,
    p_month_count => 24
  );
  pkg_merchant_analytics.refresh_analytics;
END;
/
`;
fs.writeFileSync(output, content, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), output)}`);
