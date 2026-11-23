const { parseDateBound } = require('../utils/date-filters');

test('date-only end bounds include the full calendar day', () => {
  expect(parseDateBound('2026-01-31', true).toISOString()).toBe('2026-01-31T23:59:59.999Z');
});

test('timestamp end bounds preserve their supplied instant', () => {
  expect(parseDateBound('2026-01-31T10:15:00.000Z', true).toISOString()).toBe('2026-01-31T10:15:00.000Z');
});
