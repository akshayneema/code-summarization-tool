import React from 'react';
import { render } from '@testing-library/react';
import PieChartComp from './PieChartComp';

describe('PieChartComp Component', () => {
  it('should render without crashing', () => {
    render(<PieChartComp data={[]} />);
  });

  it('should display "No data available" message when data is empty', () => {
    const { getByTestId } = render(<PieChartComp data={[]} />);
    expect(getByTestId('pie-no-data-available').textContent).toBe('No data available');
  });

  it('should render chart when data is provided', () => {
    const data = [
      { name: 'A', rating: 10 },
      { name: 'B', rating: 20 },
      { name: 'C', rating: 30 },
    ];
    const { container } = render(<PieChartComp data={data} />);
    const chart = container.querySelector('.recharts-wrapper');
    expect(chart).toBeTruthy();
  });
});
