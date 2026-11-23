const MERCHANT_COUNT = 50;
const PROFILE_COUNT = 100;
const TRANSACTION_COUNT = 100000;
const DETAIL_COUNT = 10000;

const categories = ['GROCERY', 'FUEL', 'RETAIL', 'UTILITIES', 'DIGITAL'];
const segments = ['high', 'medium', 'dormant', 'new', 'growing', 'fraudulent'];

function generateDummyData(now = new Date()) {
  let state = 48271;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  const merchants = Array.from({ length: MERCHANT_COUNT }, (_, index) => {
    const segment = segments[index % segments.length];
    const created = new Date(now);
    created.setUTCMonth(created.getUTCMonth() - (segment === 'new' ? Math.floor(random() * 3) : 25 + Math.floor(random() * 48)));
    const active = segment !== 'dormant';
    return {
      id: index + 1,
      name: `${['Northstar', 'Blue', 'Cedar', 'Summit', 'Harbor'][index % 5]} ${['Markets', 'Services', 'Trading', 'Stores', 'Digital'][Math.floor(index / 5) % 5]} ${String(index + 1).padStart(2, '0')}`,
      msisdn: `2567${String(10000000 + index).slice(-8)}`,
      status: active ? 'ACTIVE' : 'DORMANT',
      active,
      categoryCode: categories[index % categories.length],
      merchantType: index % 2 ? 'BUSINESS' : 'INDIVIDUAL',
      segment,
      createdOn: created.toISOString(),
      lastTransactionOn: segment === 'dormant' ? new Date(now.getTime() - 120 * 86400000).toISOString() : new Date(now.getTime() - Math.floor(random() * 25) * 86400000).toISOString()
    };
  });
  const profiles = Array.from({ length: PROFILE_COUNT }, (_, index) => {
    const merchant = merchants[index % merchants.length];
    return {
      id: index + 1,
      merchantId: merchant.id,
      merchantName: merchant.name,
      accountId: `DEMO-ACC-${String(index + 1).padStart(8, '0')}`,
      categoryCode: merchant.categoryCode,
      serviceType: 'PAYMENT',
      gradeCode: index % 4 === 0 ? 'A' : 'B',
      merchantType: merchant.merchantType
    };
  });
  const transactions = new Array(TRANSACTION_COUNT);
  for (let index = 0; index < TRANSACTION_COUNT; index += 1) {
    const merchant = merchants[Math.floor(random() * merchants.length)];
    const ageDays = Math.floor(random() * 730);
    const date = new Date(now.getTime() - ageDays * 86400000);
    const bias = merchant.segment === 'high' ? 18 : merchant.segment === 'fraudulent' ? 8 : merchant.segment === 'dormant' ? 0.15 : 1;
    const amount = Math.round((500 + random() * 95000) * bias * 100) / 100;
    transactions[index] = {
      id: index + 1,
      merchantId: merchant.id,
      merchantName: merchant.name,
      transactionDate: date.toISOString(),
      totalAmount: amount,
      revenue: Math.round(amount * 0.018 * 100) / 100,
      tax: Math.round(amount * 0.001 * 100) / 100,
      txnCount: 1,
      distinctRecipients: 1 + Math.floor(random() * 4),
      categoryCode: merchant.categoryCode,
      status: merchant.segment === 'fraudulent' && random() < 0.16 ? 'FAILED' : 'SUCCESS'
    };
  }
  const transferDetails = Array.from({ length: DETAIL_COUNT }, (_, index) => {
    const merchant = merchants[index % merchants.length];
    const date = new Date(now.getTime() - Math.floor(random() * 730) * 86400000);
    const failed = index % 20 === 0;
    return {
      id: index + 1,
      transferId: `DEMO-TXN-${String(index + 1).padStart(10, '0')}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      transferDate: date.toISOString(),
      transferType: 'MERCHANT_PAYMENT',
      errorCode: failed ? 'E100' : null,
      message: failed ? 'Synthetic failed transfer' : 'Synthetic transfer',
      requestedAmount: Math.round((500 + random() * 99500) * 100) / 100
    };
  });
  const monthlySubscribers = [];
  for (let merchantIndex = 0; merchantIndex < merchants.length; merchantIndex += 1) {
    const merchant = merchants[merchantIndex];
    for (let monthsAgo = 23; monthsAgo >= 0; monthsAgo -= 1) {
      const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, 1));
      const trend = merchant.segment === 'growing' ? 1 + (23 - monthsAgo) * 0.035 : merchant.segment === 'dormant' ? 0.35 : 1;
      const uniqueSubscribers = Math.max(0, Math.round((120 + merchantIndex * 12 + random() * 80) * trend));
      monthlySubscribers.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        month: month.toISOString().slice(0, 10),
        uniqueSubscribers
      });
    }
  }
  return { merchants, profiles, transactions, transferDetails, monthlySubscribers };
}

module.exports = { generateDummyData, MERCHANT_COUNT, PROFILE_COUNT, TRANSACTION_COUNT, DETAIL_COUNT };
