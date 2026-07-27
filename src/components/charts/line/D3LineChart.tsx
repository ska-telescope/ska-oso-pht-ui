import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

type LineData = { name: string | number; value: number; group?: string };

type Props = {
  data: LineData[];
  chartColors?: Record<string, { bg?: string; fg?: string }> | null;
  colorType?: string;
  width: number;
  height: number;
  xDomain?: [number, number]; // allow override
  yDomain?: [number, number]; // allow override
};

const FONT_SIZE = 18;

const D3LineChart: React.FC<Props> = ({
  data,
  chartColors,
  colorType = 'observationType',
  width,
  height,
  xDomain,
  yDomain
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const theme = useTheme();

  // Initial scaffolding
  useEffect(() => {
    if (!svgRef.current || width <= 0 || height <= 0) return;

    const margin = { top: 40, right: 20, bottom: 40, left: 50 };
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
      .attr('transform', `translate(${margin.left},${margin.top - 20})`);
  }, [width, height]);

  // Update phase
  useEffect(() => {
    if (!svgRef.current || data.length === 0 || width <= 0 || height <= 0) return;

    const margin = { top: 40, right: 20, bottom: 40, left: 50 };
    const svg = d3.select(svgRef.current);
    const chartGroup = svg.select<SVGGElement>('.chart-group');

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Detect numeric vs categorical x values
    const isNumeric = typeof data[0].name === 'number';

    let x: d3.ScaleLinear<number, number> | d3.ScalePoint<string>;
    if (isNumeric) {
      const defaultXDomain: [number, number] = [
        d3.min(data, d => d.name as number)!,
        d3.max(data, d => d.name as number)!
      ];
      x = d3
        .scaleLinear()
        .domain(xDomain ?? defaultXDomain)
        .range([0, innerW]);
    } else {
      const categories = data.map(d => d.name as string);
      x = d3
        .scalePoint()
        .domain(categories)
        .range([0, innerW])
        .padding(0.5);
    }

    const defaultYDomain: [number, number] = [0, d3.max(data, d => d.value)!];
    const y = d3
      .scaleLinear()
      .domain(yDomain ?? defaultYDomain)
      .nice()
      .range([innerH, 0]);

    const groups = Array.from(new Set(data.map(d => d.group).filter(Boolean) as string[]));
    const fallbackColors = d3.schemeTableau10;
    const color = d3
      .scaleOrdinal<string, string>()
      .domain(groups.length ? groups : ['default'])
      .range(fallbackColors);

    // Update axes
    chartGroup
      .select<SVGGElement>('.x-axis')
      .call(
        isNumeric
          ? d3.axisBottom(x as d3.ScaleLinear<number, number>)
          : d3.axisBottom(x as d3.ScalePoint<string>)
      )
      .selectAll('text')
      .style('font-size', `${FONT_SIZE}px`)
      .style('fill', theme.palette.text.primary);

    chartGroup
      .select<SVGGElement>('.y-axis')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', `${FONT_SIZE}px`)
      .style('fill', theme.palette.text.primary);

    // Group data by series
    const series = groups.length
      ? groups.map(g => ({
          key: g,
          values: data.filter(d => d.group === g)
        }))
      : [{ key: 'default', values: data }];

    // Line generator with defined() to skip first and last points
    const line = d3
      .line<LineData>()
      .defined((_, i, arr) => i > 0 && i < arr.length - 1) // skip endpoints
      .x(d =>
        isNumeric
          ? (x as d3.ScaleLinear<number, number>)(d.name as number)
          : (x as d3.ScalePoint<string>)(d.name as string)!
      )
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Clear old line(s) and draw new
    chartGroup.selectAll('path.line').remove();
    series.forEach(s => {
      chartGroup
        .append('path')
        .datum(s.values)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', chartColors?.[s.key.toLowerCase()]?.bg ?? color(s.key))
        .attr('d', line);
    });

    // Points
    const points = chartGroup
      .selectAll<SVGCircleElement, LineData>('circle.point')
      .data(data, d => `${d.name}-${d.group ?? 'default'}`);

    points
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d =>
        isNumeric
          ? (x as d3.ScaleLinear<number, number>)(d.name as number)
          : (x as d3.ScalePoint<string>)(d.name as string)!
      )
      .attr('cy', d => y(d.value))
      .attr('r', 5)
      .attr(
        'fill',
        d => chartColors?.[(d.group ?? 'default').toLowerCase()]?.bg ?? color(d.group ?? 'default')
      );

    points
      .transition()
      .duration(800)
      .attr('cx', d =>
        isNumeric
          ? (x as d3.ScaleLinear<number, number>)(d.name as number)
          : (x as d3.ScalePoint<string>)(d.name as string)!
      )
      .attr('cy', d => y(d.value));

    points.exit().remove();

    // Legend
    const legend = svg.select<SVGGElement>('.legend');
    legend.selectAll('*').remove();
    let offsetX = 0;
    series.forEach(s => {
      const legendItem = legend.append('g').attr('transform', `translate(${offsetX},0)`);
      legendItem
        .append('rect')
        .attr('width', FONT_SIZE)
        .attr('height', FONT_SIZE / 2)
        .attr('fill', chartColors?.[s.key.toLowerCase()]?.bg ?? color(s.key));
      const text = legendItem
        .append('text')
        .attr('x', FONT_SIZE + 5)
        .attr('y', FONT_SIZE * 0.85)
        .style('font-size', FONT_SIZE)
        .style('fill', theme.palette.text.primary)
        .text(s.key);
      const textWidth = (text.node() as SVGTextElement).getBBox().width;
      offsetX += FONT_SIZE + 5 + textWidth + 20;
    });
  }, [data, chartColors, colorType, width, height, xDomain, yDomain, theme]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        role="presentation"
        aria-label="Line chart visualization"
        data-testid="line-chart-svg"
      />
    </div>
  );
};

export default D3LineChart;
