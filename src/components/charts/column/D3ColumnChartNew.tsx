import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

type ColumnData = { name: string; value: number; group?: string };

type Props = {
  data: ColumnData[];
  chartColors?: Record<string, { bg?: string; fg?: string }> | null;
  colorType?: string;
};

const D3ColumnChart: React.FC<Props> = ({ data, chartColors, colorType = 'observationType' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 500;
    const height = 320;
    const margin = { top: 40, right: 20, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block');

    const chartGroup = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const categories = Array.from(new Set(data.map(d => d.name)));
    const groups = Array.from(new Set(data.map(d => d.group).filter(Boolean) as string[]));

    const x0 = d3
      .scaleBand()
      .domain(categories)
      .range([0, innerW])
      .padding(0.2);
    const x1 = groups.length
      ? d3
          .scaleBand()
          .domain(groups)
          .range([0, x0.bandwidth()])
          .padding(0.08)
      : null;

    const maxY = d3.max(data, d => d.value) ?? 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([innerH, 0]);

    const fallbackColors = d3.schemeTableau10;
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(groups.length ? groups : categories)
      .range(fallbackColors);

    // Axes
    chartGroup
      .append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x0));

    chartGroup.append('g').call(d3.axisLeft(y));

    // Bars + labels
    const catGroups = chartGroup
      .selectAll('.cat')
      .data(categories)
      .enter()
      .append('g')
      .attr('class', 'cat')
      .attr('transform', d => `translate(${x0(d)},0)`);

    if (groups.length && x1) {
      // Grouped bars
      const bars = catGroups
        .selectAll('rect')
        .data(cat => data.filter(d => d.name === cat))
        .enter();

      bars
        .append('rect')
        .attr('x', d => x1(d.group!)!)
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => innerH - y(d.value))
        .attr('fill', d => {
          const key = d.group?.toLowerCase() ?? '';
          return chartColors?.[key]?.bg ?? color(d.group ?? '');
        })
        .on('mouseover', (event, d) => {
          const tooltip = tooltipRef.current;
          const rect = svgRef.current?.getBoundingClientRect();
          if (!tooltip || !rect) return;
          tooltip.style.opacity = '1';
          tooltip.style.left = `${event.clientX - rect.left + 10}px`;
          tooltip.style.top = `${event.clientY - rect.top + 10}px`;
          tooltip.innerHTML = `<strong>${d.name}</strong><br/>${d.group}: ${d.value}`;
        })
        .on('mousemove', event => {
          const tooltip = tooltipRef.current;
          const rect = svgRef.current?.getBoundingClientRect();
          if (!tooltip || !rect) return;
          tooltip.style.left = `${event.clientX - rect.left + 10}px`;
          tooltip.style.top = `${event.clientY - rect.top + 10}px`;
        })
        .on('mouseout', () => {
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        });

      // Labels above grouped bars
      bars
        .append('text')
        .attr('x', d => x1(d.group!)! + x1.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', theme.palette.text.primary)
        .text(d => d.value);

      // Legend
      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${margin.left},${margin.top - 25})`);

      groups.forEach((g, i) => {
        const legendItem = legend.append('g').attr('transform', `translate(${i * 100},0)`);

        legendItem
          .append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', chartColors?.[g.toLowerCase()]?.bg ?? color(g));

        legendItem
          .append('text')
          .attr('x', 18)
          .attr('y', 10)
          .style('font-size', '12px')
          .style('fill', theme.palette.text.primary)
          .text(g);
      });
    } else {
      // Single series (original behaviour)
      const bars = chartGroup
        .selectAll('.bar')
        .data(data)
        .enter();

      bars
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x0(d.name)!)
        .attr('y', d => y(d.value))
        .attr('width', x0.bandwidth())
        .attr('height', d => innerH - y(d.value))
        .attr('fill', (d, i) => {
          const key = d.name.toLowerCase();
          if (chartColors && chartColors[key]?.bg) {
            return chartColors[key]!.bg!;
          }
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
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        });

      // Labels above ungrouped bars
      bars
        .append('text')
        .attr('x', d => x0(d.name)! + x0.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', theme.palette.text.primary)
        .text(d => d.value);
    }
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
