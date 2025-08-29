import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import D3PieChart from './D3PieChart';

const mockTheme = createTheme({
  palette: {
    background: { paper: '#ffffff' },
    text: { primary: '#000000', secondary: '#666666' },
    divider: '#cccccc'
  },
  typography: {
    h6: { fontSize: '20px' },
    caption: { fontSize: '12px' },
    body2: { fontSize: '14px' }
  },
  spacing: (factor: number) => `${factor * 8}px`,
  shape: { borderRadius: 4 },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.2)',
    '0px 3px 6px rgba(0,0,0,0.3)',
    '0px 5px 10px rgba(0,0,0,0.4)'
  ]
});

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={mockTheme}>{ui}</ThemeProvider>);

const sampleData = [
  { name: 'Apples', value: 30 },
  { name: 'Bananas', value: 70 }
];

describe('D3PieChart', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // for transitions
  });

  it('renders the SVG container', () => {
    renderWithTheme(<D3PieChart data={sampleData} />);
    expect(screen.getByTestId('pie-chart-svg')).toBeInTheDocument();
  });

  it('renders center total when showTotal is true', () => {
    renderWithTheme(<D3PieChart data={sampleData} showTotal />);
    expect(screen.getByTestId('pie-chart-center-text')).toHaveTextContent('100');
  });

  it('renders custom center text', () => {
    renderWithTheme(<D3PieChart data={sampleData} showTotal centerText="Fruit Count" />);
    expect(screen.getByTestId('pie-chart-center-text')).toHaveTextContent('Fruit Count');
  });

  it('renders labels for each slice', () => {
    renderWithTheme(<D3PieChart data={sampleData} />);
    expect(screen.getByTestId('pie-chart-label-Apples')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart-label-Bananas')).toBeInTheDocument();
  });

  it('does not render chart if data is empty', () => {
    renderWithTheme(<D3PieChart data={[]} />);
    const svg = screen.getByTestId('pie-chart-svg');
    expect(svg.querySelectorAll('path').length).toBe(0);
  });

  it('shows tooltip on mouseover and hides on mouseout', () => {
    renderWithTheme(<D3PieChart data={sampleData} />);
    const svg = screen.getByTestId('pie-chart-svg');
    const path = svg.querySelector('path');
    const tooltip = screen.getByTestId('pie-chart-tooltip');

    expect(tooltip).toHaveStyle('opacity: 0');

    fireEvent.mouseOver(path!);
    expect(tooltip).toHaveStyle('opacity: 1');

    fireEvent.mouseOut(path!);
    expect(tooltip).toHaveStyle('opacity: 0');
  });

  it('positions tooltip on mousemove', () => {
    renderWithTheme(<D3PieChart data={sampleData} />);
    const svg = screen.getByTestId('pie-chart-svg');
    const path = svg.querySelector('path');

    fireEvent.mouseMove(path!, {
      clientX: 120,
      clientY: 80
    });

    const tooltip = screen.getByTestId('pie-chart-tooltip');
    expect(tooltip.style.left).toMatch(/px/);
    expect(tooltip.style.top).toMatch(/px/);
  });
});
