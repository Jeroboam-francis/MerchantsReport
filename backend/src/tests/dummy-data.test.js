const { generateDummyData } = require('../data/generate-dummy-data');

test('generates expected synthetic dataset dimensions and history', () => {
  const data = generateDummyData(new Date('2026-01-15T00:00:00.000Z'));
  expect(data.merchants).toHaveLength(50);
  expect(data.profiles).toHaveLength(100);
  expect(data.transactions).toHaveLength(100000);
  expect(data.transferDetails).toHaveLength(10000);
  expect(data.monthlySubscribers).toHaveLength(50 * 24);
  expect(new Set(data.merchants.map((merchant) => merchant.segment))).toEqual(new Set(['high', 'medium', 'dormant', 'new', 'growing', 'fraudulent']));
});
