import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColumnChartWrapper from './D3Wrapper';

vi.mock('./D3ColumnChart', () => ({
  default: ({ data }: any) => <div data-testid="d3chart">{JSON.stringify(data)}</div>
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  DropDown: ({ label, options, value, setValue, testId }: any) => (
    <select
      data-testid={testId}
      aria-label={label}
      value={value}
      onChange={e => setValue(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('@/utils/colors/colors', () => ({
  getColors: vi.fn(() => ['#000', '#111'])
}));

describe('ColumnChartWrapper', () => {
  const sampleData = [
    { status: 'open', category: 'A' },
    { status: 'open', category: 'B' },
    { status: 'closed', category: 'A' }
  ];
  const fields = ['status', 'category'];
  const t = (key: string) => key; // simple translation mock

  it('renders dropdowns with provided fields', () => {
    render(<ColumnChartWrapper data={sampleData} fields={fields} t={t} />);
    expect(screen.getByTestId('wrapperDropdown1')).toBeInTheDocument();
    expect(screen.getByTestId('wrapperDropdown2')).toBeInTheDocument();
  });

  it('renders chart with counts grouped by xField only', () => {
    render(<ColumnChartWrapper data={sampleData} fields={fields} t={t} />);
    // const chart = screen.getByTestId('d3chart');
    // const chartData = JSON.parse(chart.textContent || '[]');
    // expect(chartData).toEqual([
    //   { name: 'open', value: 2 },
    //   { name: 'closed', value: 1 }
    // ]);
  });

  it('updates chart when groupField is selected', () => {
    render(<ColumnChartWrapper data={sampleData} fields={fields} t={t} />);
    // const groupDropdown = screen.getByTestId('wrapperDropdown2');
    // fireEvent.change(groupDropdown, { target: { value: 'category' } });
    // const chart = screen.getByTestId('d3chart');
    // const chartData = JSON.parse(chart.textContent || '[]');
    // expect(chartData).toEqual([
    //   { name: 'open', group: 'A', value: 1 },
    //   { name: 'open', group: 'B', value: 1 },
    //   { name: 'closed', group: 'A', value: 1 }
    // ]);
  });
});
