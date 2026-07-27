import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

type ColumnData = { name: string; value: number; group?: string };

type Props = {
  data: ColumnData[];
  chartColors?: Record<string, { bg?: string; fg?: string }> | null;
  colorType?: string;
  width: number;
  height: number;
};

const FONT_SIZE = 18;

const D3ColumnChart: React.FC<Props> = ({
  data,
  chartColors,
  colorType = 'observationType',
  width,
  height
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  // --- Initial render: build chart scaffolding once ---
  useEffect(() => {
    if (!svgRef.current || width <= 0 || height <= 0) return;

    const margin = { top: 40, right: 20, bottom: 0, left: 50 };
    const svg = d3.select(svgRef.current);

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block');

    const chartGroup = svg
      .append('g')
      .attr('class', 'chart-group')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerH = height - margin.top - margin.bottom;

    chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerH})`);

    chartGroup.append('g').attr('class', 'y-axis');

    svg
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left},${margin.top - 50})`);
  }, [width, height]);

  // --- Update phase: runs when data or theme changes ---
  useEffect(() => {
    if (!svgRef.current || data.length === 0 || width <= 0 || height <= 0) return;

    const margin = { top: 40, right: 20, bottom: 0, left: 50 };
    const svg = d3.select(svgRef.current);
    const chartGroup = svg.select<SVGGElement>('.chart-group');

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

    // Update axes
    chartGroup
      .select<SVGGElement>('.x-axis')
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('font-size', `${FONT_SIZE}px`)
      .style('fill', theme.palette.text.primary);

    chartGroup
      .select<SVGGElement>('.y-axis')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', `${FONT_SIZE}px`)
      .style('fill', theme.palette.text.primary);

    // Bars + labels
    if (groups.length && x1) {
      const bars = chartGroup
        .selectAll<SVGRectElement, ColumnData>('rect')
        .data(data, d => `${d.name}-${d.group}`);

      bars
        .enter()
        .append('rect')
        .attr('x', d => x0(d.name)! + x1(d.group!)!)
        .attr('y', innerH)
        .attr('width', x1.bandwidth())
        .attr('height', 0)
        .attr('fill', d => chartColors?.[d.group!.toLowerCase()]?.bg ?? color(d.group!))
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.value))
        .attr('height', d => innerH - y(d.value));

      bars
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('x', d => x0(d.name)! + x1(d.group!)!)
        .attr('y', d => y(d.value))
        .attr('width', x1.bandwidth())
        .attr('height', d => innerH - y(d.value))
        .attr('fill', d => chartColors?.[d.group!.toLowerCase()]?.bg ?? color(d.group!));

      bars.exit().remove();

      const labels = chartGroup
        .selectAll<SVGTextElement, ColumnData>('text.bar-label')
        .data(data, d => `${d.name}-${d.group}`);

      labels
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x0(d.name)! + x1(d.group!)! + x1.bandwidth() / 2)
        .attr('y', innerH - 5)
        .attr('text-anchor', 'middle')
        .style('opacity', 0)
        .style('font-size', FONT_SIZE)
        .style('fill', theme.palette.text.primary)
        .text(d => `${d.value} (${d.group})`)
        .transition()
        .delay(800)
        .duration(400)
        .style('opacity', 1)
        .attr('y', d => y(d.value) - 5);

      labels
        .transition()
        .duration(400)
        .text(d => `${d.value} (${d.group})`)
        .attr('x', d => x0(d.name)! + x1(d.group!)! + x1.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .style('fill', theme.palette.text.primary);

      labels.exit().remove();

      // Legend
      const legend = svg.select<SVGGElement>('.legend');
      legend.selectAll('*').remove();
      let offsetX = 0;
      groups.forEach(g => {
        const legendItem = legend.append('g').attr('transform', `translate(${offsetX},0)`);
        legendItem
          .append('rect')
          .attr('width', FONT_SIZE)
          .attr('height', FONT_SIZE)
          .attr('fill', chartColors?.[g.toLowerCase()]?.bg ?? color(g));
        const text = legendItem
          .append('text')
          .attr('x', FONT_SIZE + 5)
          .attr('y', FONT_SIZE * 0.85)
          .style('font-size', FONT_SIZE)
          .style('fill', theme.palette.text.primary)
          .text(g);
        const textWidth = (text.node() as SVGTextElement).getBBox().width;
        offsetX += FONT_SIZE + 5 + textWidth + 20;
      });
    } else {
      const bars = chartGroup
        .selectAll<SVGRectElement, ColumnData>('rect.bar')
        .data(data, d => d.name);

      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x0(d.name)!)
        .attr('y', innerH)
        .attr('width', x0.bandwidth())
        .attr('height', 0)
        .attr(
          'fill',
          (d, i) =>
            chartColors?.[d.name.toLowerCase()]?.bg ?? fallbackColors[i % fallbackColors.length]
        )
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('y', d => y(d.value))
        .attr('height', d => innerH - y(d.value));

      bars
        .transition()
        .duration(800)
        .ease(d3.easeCubicOut)
        .attr('x', d => x0(d.name)!)
        .attr('y', d => y(d.value))
        .attr('width', x0.bandwidth())
        .attr('height', d => innerH - y(d.value))
        .attr(
          'fill',
          (d, i) =>
            chartColors?.[d.name.toLowerCase()]?.bg ?? fallbackColors[i % fallbackColors.length]
        );

      bars.exit().remove();

      const labels = chartGroup
        .selectAll<SVGTextElement, ColumnData>('text.bar-label')
        .data(data, d => d.name);

      labels
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => x0(d.name)! + x0.bandwidth() / 2)
        .attr('y', innerH - 5)
        .attr('text-anchor', 'middle')
        .style('opacity', 0)
        .style('font-size', FONT_SIZE)
        .style('fill', theme.palette.text.primary)
        .text(d => d.value)
        .transition()
        .delay(800)
        .duration(400)
        .style('opacity', 1)
        .attr('y', d => y(d.value) - 5);

      labels
        .transition()
        .duration(400)
        .text(d => d.value)
        .attr('x', d => x0(d.name)! + x0.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .style('fill', theme.palette.text.primary);

      labels.exit().remove();
    }
  }, [data, chartColors, colorType, width, height, theme]);

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
          fontSize: FONT_SIZE,
          zIndex: 10
        }}
      />
    </div>
  );
};

export default D3ColumnChart;
