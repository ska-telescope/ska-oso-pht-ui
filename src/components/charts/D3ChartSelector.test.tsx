import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { D3ChartSelector } from './D3ChartSelector';

const mockData = [
  { category: 'Fruit', type: 'Apple', value: 10 },
  { category: 'Fruit', type: 'Banana', value: 15 },
  { category: 'Vegetable', type: 'Carrot', value: 8 }
];

describe('D3ChartSelector', () => {
  it('renders all selectors with correct default values', () => {
    render(<D3ChartSelector data={mockData} />);

    const chartTypeSelect = screen.getByTestId('chartTypeSelect') as HTMLSelectElement;
    const groupFieldSelect = screen.getByTestId('groupFieldSelect') as HTMLSelectElement;
    const valueFieldSelect = screen.getByTestId('valueFieldSelect') as HTMLSelectElement;

    expect(chartTypeSelect).toBeInTheDocument();
    expect(groupFieldSelect).toBeInTheDocument();
    expect(valueFieldSelect).toBeInTheDocument();

    expect(chartTypeSelect.value).toBe('bar');
    expect(groupFieldSelect.value).toBe('category');
    expect(valueFieldSelect.value).toBe('value');
  });

  it('renders bar chart SVG by default', () => {
    render(<D3ChartSelector data={mockData} />);
    const barChartSvg = screen.getByTestId('barChartSvg');
    expect(barChartSvg).toBeInTheDocument();
  });

  it('switches to pie chart and renders pie chart SVG', () => {
    render(<D3ChartSelector data={mockData} />);
    const chartTypeSelect = screen.getByTestId('chartTypeSelect');

    fireEvent.change(chartTypeSelect, { target: { value: 'pie' } });

    const pieChartSvg = screen.getByTestId('pieChartSvg');
    expect(pieChartSvg).toBeInTheDocument();
  });

  it('updates group field selection', () => {
    render(<D3ChartSelector data={mockData} />);
    const groupFieldSelect = screen.getByTestId('groupFieldSelect') as HTMLSelectElement;

    fireEvent.change(groupFieldSelect, { target: { value: 'type' } });
    expect(groupFieldSelect.value).toBe('type');
  });

  it('updates value field selection when chart type is bar', () => {
    render(<D3ChartSelector data={mockData} />);
    const valueFieldSelect = screen.getByTestId('valueFieldSelect') as HTMLSelectElement;

    fireEvent.change(valueFieldSelect, { target: { value: 'value' } });
    expect(valueFieldSelect.value).toBe('value');
  });

  it('hides value field selector when chart type is pie', () => {
    render(<D3ChartSelector data={mockData} />);
    const chartTypeSelect = screen.getByTestId('chartTypeSelect');

    fireEvent.change(chartTypeSelect, { target: { value: 'pie' } });

    expect(screen.queryByTestId('valueFieldSelect')).not.toBeInTheDocument();
  });

  it('shows fallback message when data is empty', () => {
    render(<D3ChartSelector data={[]} />);
    const fallback = screen.getByTestId('noDataMessage');
    expect(fallback).toBeInTheDocument();
    expect(fallback.textContent).toMatch(/no data available/i);
  });
});
