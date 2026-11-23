import { render, screen } from '@testing-library/react';
import MetricCard from '../components/MetricCard';

test('renders metric label, value and supporting detail', () => {
  render(<MetricCard label="Total revenue" value="UGX 1,200" detail="Last 30 days" icon="↗" />);
  expect(screen.getByText('Total revenue')).toBeInTheDocument();
  expect(screen.getByText('UGX 1,200')).toBeInTheDocument();
  expect(screen.getByText('Last 30 days')).toBeInTheDocument();
});
