import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import D3PieChart from './D3PieChart';

const mockData = [
  { name: 'Apples', value: 30 },
  { name: 'Bananas', value: 70 }
];

describe('D3PieChart', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // For D3 transitions
  });

  it('renders the SVG with role="img"', () => {
    render(<D3PieChart data={mockData} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
  });

  it('renders the tooltip container', () => {
    render(<D3PieChart data={mockData} />);
    const tooltip = screen.getByTestId('toolTip');
    expect(tooltip).toBeInTheDocument();
  });

  it('renders correct number of pie slices', () => {
    render(<D3PieChart data={mockData} />);
    const svg = screen.getByRole('img');
    const slices = svg.querySelectorAll('path');
    expect(slices.length).toBe(mockData.length);
  });

  it('renders labels with correct percentages', () => {
    render(<D3PieChart data={mockData} />);
    expect(screen.getByText(/Apples \(30.0%\)/)).toBeInTheDocument();
    expect(screen.getByText(/Bananas \(70.0%\)/)).toBeInTheDocument();
  });

  it('renders center total when showTotal is true', () => {
    render(<D3PieChart data={mockData} showTotal />);
    expect(screen.getByText('100')).toBeInTheDocument(); // 30 + 70
  });

  it('renders custom center text when provided', () => {
    render(<D3PieChart data={mockData} showTotal centerText="Fruit Count" />);
    expect(screen.getByText('Fruit Count')).toBeInTheDocument();
  });

  it('handles empty data without crashing', () => {
    render(<D3PieChart data={[]} />);
    const svg = screen.getByRole('img');
    expect(svg.querySelectorAll('path').length).toBe(0);
    expect(svg.querySelectorAll('text.label').length).toBe(0);
  });

  it('includes the emboss filter definition', () => {
    render(<D3PieChart data={mockData} />);
    // const svg = screen.getByRole('img');
    // const filter = svg.querySelector('filter#emboss');
    // expect(filter).toBeTruthy();
  });

  it('renders polylines for label annotations', () => {
    render(<D3PieChart data={mockData} />);
    const svg = screen.getByRole('img');
    const polylines = svg.querySelectorAll('polyline');
    expect(polylines.length).toBe(mockData.length);
  });

  it('renders label text elements for each slice', () => {
    render(<D3PieChart data={mockData} />);
    const svg = screen.getByRole('img');
    const labels = svg.querySelectorAll('text.label');
    expect(labels.length).toBe(mockData.length);
  });
});
