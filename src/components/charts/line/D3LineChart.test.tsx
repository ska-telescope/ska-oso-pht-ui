// D3LineChart.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import D3LineChart from './D3LineChart';

const theme = createTheme();

describe('D3LineChart', () => {
  it('renders the SVG element', () => {
    render(
      <ThemeProvider theme={theme}>
        <D3LineChart data={[]} width={400} height={300} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('line-chart-svg')).toBeInTheDocument();
  });

  it('renders a line and points for simple data', () => {
    const sampleData = [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 },
      { name: 'C', value: 15 }
    ];

    render(
      <ThemeProvider theme={theme}>
        <D3LineChart data={sampleData} width={400} height={300} />
      </ThemeProvider>
    );

    const svg = screen.getByTestId('line-chart-svg');
    // Line path
    const paths = svg.querySelectorAll('path.line');
    expect(paths.length).toBe(1);

    // Points
    const points = svg.querySelectorAll('circle.point');
    expect(points.length).toBe(sampleData.length);

    // Labels are not used here, but we can check point positions
    const cxValues = Array.from(points).map(p => p.getAttribute('cx'));
    expect(cxValues.length).toBe(sampleData.length);
  });

  it('renders multiple lines and legend for grouped data', () => {
    const groupedData = [
      { name: 'A', value: 10, group: 'G1' },
      { name: 'B', value: 20, group: 'G1' },
      { name: 'A', value: 15, group: 'G2' },
      { name: 'B', value: 25, group: 'G2' }
    ];

    render(
      <ThemeProvider theme={theme}>
        <D3LineChart data={groupedData} width={500} height={400} />
      </ThemeProvider>
    );

    const svg = screen.getByTestId('line-chart-svg');
    const paths = svg.querySelectorAll('path.line');
    expect(paths.length).toBe(2); // one per group

    const points = svg.querySelectorAll('circle.point');
    expect(points.length).toBe(groupedData.length);

    // Legend items
    const legend = svg.querySelector('.legend');
    expect(legend).toBeTruthy();
    const legendTexts = legend?.querySelectorAll('text') ?? [];
    const legendLabels = Array.from(legendTexts).map(t => t.textContent);
    expect(legendLabels).toContain('G1');
    expect(legendLabels).toContain('G2');
  });
});
