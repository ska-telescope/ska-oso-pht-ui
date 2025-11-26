import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

type ColumnData = { name: string; value: number };
type Props = {
  data: ColumnData[];
  chartColors?: Record<string, { bg?: string; fg?: string }> | null; // results of getColors
  colorType?: string; // optional type, defaults to 'observationType'
};

const D3ColumnChart: React.FC<Props> = ({ data, chartColors, colorType = 'observationType' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block');

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width - margin.left - margin.right])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value)!])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    // fallback palette
    const fallbackColors = d3.schemeTableau10;

    // Bars
    chartGroup
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - margin.top - margin.bottom - y(d.value))
      .attr('fill', (d, i) => {
        const key = d.name.toLowerCase();
        // use chartColors mapping if available
        if (chartColors && chartColors[key]?.bg) {
          return chartColors[key]!.bg!;
        }
        // safe fallback
        return fallbackColors[i % fallbackColors.length];
      })
      .on('mouseover', (event, d) => {
        const tooltip = tooltipRef.current;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!tooltip || !rect) return;

        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX - rect.left + 10}px`;
        tooltip.style.top = `${event.clientY - rect.top + 10}px`;
        tooltip.innerHTML = `<strong>${d.name}</strong>: ${d.value}`;
      })
      .on('mousemove', event => {
        const tooltip = tooltipRef.current;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!tooltip || !rect) return;

        tooltip.style.left = `${event.clientX - rect.left + 10}px`;
        tooltip.style.top = `${event.clientY - rect.top + 10}px`;
      })
      .on('mouseout', () => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;
        tooltip.style.opacity = '0';
      });

    // Axes
    chartGroup
      .append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    chartGroup.append('g').call(d3.axisLeft(y));
  }, [data, chartColors, colorType]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        role="presentation"
        aria-label="Column chart visualization"
        data-testid="column-chart-svg"
      />
      <div
        ref={tooltipRef}
        data-testid="column-chart-tooltip"
        style={{
          position: 'absolute',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: theme.spacing(1.5),
          borderRadius: theme.shape.borderRadius,
          boxShadow: theme.shadows[3],
          pointerEvents: 'none',
          opacity: 0,
          transition: 'opacity 0.2s ease',
          fontSize: theme.typography.body2.fontSize,
          zIndex: 10
        }}
      />
    </div>
  );
};

export default D3ColumnChart;
