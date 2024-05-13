import React from 'react';
import { render } from '@testing-library/react';
import BarGraphComp from './BarGraphComp';

describe('BarGraphComp', () => {
  it('should render without crashing', () => {
    render(<BarGraphComp data={[]} />);
  });

  it('should render "No data available" message when data is empty', () => {
    const { getByTestId } = render(<BarGraphComp data={[]} />);
    expect(getByTestId('bar-no-data-available').textContent).toBe('No data available');
  });

  it('should render chart when data is provided', () => {
    const data = [
      { name: 'A', rating: 10 },
      { name: 'B', rating: 20 },
      { name: 'C', rating: 30 },
    ];
    const { container } = render(<BarGraphComp data={data} />);
    const chart = container.querySelector('.recharts-wrapper');
    expect(chart).toBeTruthy();
  });
});
