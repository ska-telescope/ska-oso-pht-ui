import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useTheme } from '@mui/material/styles';

type PieData = { name: string; value: number };
type Props = {
  data: PieData[];
  showTotal?: boolean;
  centerText?: string;
};

const D3PieChart: React.FC<Props> = ({ data, showTotal = false, centerText = '' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const logicalSize = 300;
    const radius = logicalSize / 1.5;
    const total = d3.sum(data, d => (isFinite(Number(d.value)) ? Number(d.value) : 0));
    const centerLabel = centerText || total.toString();

    const chartColors = d3.schemeTableau10;

    const pie = d3
      .pie<PieData>()
      .value(d => (isFinite(Number(d.value)) ? Number(d.value) : 0))
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(showTotal ? radius / 2 : 0)
      .outerRadius(radius);

    const outerArc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(radius * 1.05)
      .outerRadius(radius * 1.05);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${logicalSize} ${logicalSize * 0.6}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('display', 'block');

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${logicalSize / 2}, ${logicalSize / 5}) scale(0.3)`);

    const sliceData = pie(data);

    const paths = chartGroup
      .selectAll('path')
      .data(sliceData)
      .enter()
      .append('path')
      .attr('fill', (_, i) => chartColors[i % chartColors.length])
      .attr('stroke', theme.palette.background.paper)
      .attr('stroke-width', 1)
      .on('mouseover', (event, d) => {
        const tooltip = tooltipRef.current;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!tooltip || !rect) return;

        tooltip.style.opacity = '1';
        tooltip.style.left = `${event.clientX - rect.left + 10}px`;
        tooltip.style.top = `${event.clientY - rect.top + 10}px`;
        tooltip.innerHTML = `<strong>${d.data.name}</strong>: ${d.data.value} (${(
          (d.data.value / total) *
          100
        ).toFixed(1)}%)`;
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

    paths
      .transition()
      .duration(500)
      .attrTween('d', function(d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return t => arc(i(t))!;
      });

    if (showTotal) {
      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')

        .attr('data-testid', 'pie-chart-center-text')
        .style('font-size', theme.typography.h4.fontSize ?? '1.5rem')
        .style('fill', theme.palette.text.primary)
        .style('pointer-events', 'none')
        .text(centerLabel);
    }

    chartGroup
      .selectAll('polyline')
      .data(sliceData)
      .enter()
      .append('polyline')
      .attr('points', d => {
        const pos = outerArc.centroid(d);
        const midAngle = (d.startAngle + d.endAngle) / 2;
        pos[0] = radius * 1.15 * (midAngle < Math.PI ? 1 : -1);

        const points = [arc.centroid(d), outerArc.centroid(d), pos];
        return points.map(p => p.join(',')).join(' ');
      })
      .attr('fill', 'none')
      .attr('stroke', theme.palette.text.primary)
      .attr('stroke-width', 1)
      .style('pointer-events', 'none');

    chartGroup
      .selectAll('text.label')
      .data(sliceData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('data-testid', d => `pie-chart-label-${d.data.name}`)

      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midAngle = (d.startAngle + d.endAngle) / 2;
        pos[0] = radius * 1.15 * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => ((d.startAngle + d.endAngle) / 2 < Math.PI ? 'start' : 'end'))
      .attr('dy', '0.35em')
      .style('font-size', theme.typography.h5.fontSize ?? '1.25rem')
      .style('fill', theme.palette.text.primary)
      .style('pointer-events', 'none')
      .text(d => d.data.name)
      .call(wrapText, 80);

    function wrapText(text: d3.Selection<SVGTextElement, any, any, any>, width: number) {
      text.each(function() {
        const el = d3.select(this);
        const words = el.text().split(/\s+/);
        el.text(null);

        let line: string[] = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const x = el.attr('x') ?? '0';
        const y = el.attr('y') ?? '0';
        const dy = parseFloat(el.attr('dy') ?? '0');

        let tspan = el
          .append('tspan')
          .attr('x', x)
          .attr('y', y)
          .attr('dy', `${dy}em`);

        for (const word of words) {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node()!.getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            tspan = el
              .append('tspan')
              .attr('x', x)
              .attr('y', y)
              .attr('dy', `${++lineNumber * lineHeight + dy}em`)
              .text(word);
          }
        }
      });
    }
  }, [data, showTotal, centerText, isDark]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        role="presentation"
        aria-label="Pie chart visualization"
        data-testid="pie-chart-svg"
      />
      <div
        ref={tooltipRef}
        data-testid="pie-chart-tooltip"
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

export default D3PieChart;
