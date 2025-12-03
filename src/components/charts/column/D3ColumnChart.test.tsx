// D3ColumnChart.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import D3ColumnChart from './D3ColumnChart';

const theme = createTheme();

describe('D3ColumnChart', () => {
  it('renders the SVG and tooltip elements', () => {
    render(
      <ThemeProvider theme={theme}>
        <D3ColumnChart data={[]} width={400} height={300} />
      </ThemeProvider>
    );

    expect(screen.getByTestId('column-chart-svg')).toBeInTheDocument();
    expect(screen.getByTestId('column-chart-tooltip')).toBeInTheDocument();
  });

  it('renders bars and labels for simple data', async () => {
    const sampleData = [
      { name: 'A', value: 10 },
      { name: 'B', value: 20 }
    ];

    render(
      <ThemeProvider theme={theme}>
        <D3ColumnChart data={sampleData} width={400} height={300} />
      </ThemeProvider>
    );

    const svg = screen.getByTestId('column-chart-svg');
    // Bars are rendered as <rect> elements
    const rects = svg.querySelectorAll('rect.bar');
    expect(rects.length).toBe(sampleData.length);

    // Labels are rendered as <text> elements with class "bar-label"
    const labels = svg.querySelectorAll('text.bar-label');
    expect(labels.length).toBe(sampleData.length);

    // Check that one of the labels contains the correct value
    const labelTexts = Array.from(labels).map(l => l.textContent);
    expect(labelTexts).toContain('10');
    expect(labelTexts).toContain('20');
  });

  it('renders grouped bars when group data is provided', () => {
    const groupedData = [
      { name: 'A', value: 10, group: 'G1' },
      { name: 'A', value: 15, group: 'G2' },
      { name: 'B', value: 20, group: 'G1' },
      { name: 'B', value: 25, group: 'G2' }
    ];

    render(
      <ThemeProvider theme={theme}>
        <D3ColumnChart data={groupedData} width={500} height={400} />
      </ThemeProvider>
    );

    const svg = screen.getByTestId('column-chart-svg');
    const chartGroup = svg.querySelector('.chart-group')!;
    const rects = chartGroup.querySelectorAll('rect');
    expect(rects.length).toBe(groupedData.length); // now 4

    // Labels should include group info
    const labels = svg.querySelectorAll('text.bar-label');
    const labelTexts = Array.from(labels).map(l => l.textContent);
    expect(labelTexts.some(text => text?.includes('(G1)'))).toBe(true);
    expect(labelTexts.some(text => text?.includes('(G2)'))).toBe(true);
  });
});
