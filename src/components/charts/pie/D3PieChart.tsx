import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { useTheme } from '@mui/material/styles';

type PieData = { name: string; value: number };

type Props = {
  data: PieData[];
  height?: number;
  width?: number;
  showTotal?: boolean;
  centerText?: string;
};

const D3PieChart: React.FC<Props> = ({ data, showTotal = false, centerText = '' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const baseFontSize = theme.typography.htmlFontSize;
  const scale = theme.typography.fontSize / baseFontSize;
  const largerRem = `${scale + 0.25}rem`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 150, height: 200 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    // if (!svgRef.current || !tooltipRef.current) return;

    // Dimensions & margins
    const chartWidth = dimensions.width;
    const chartHeight = dimensions.height;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const svgWidth = chartWidth + margin.left + margin.right;
    const svgHeight = chartHeight + margin.top + margin.bottom;
    const radius = Math.min(chartWidth, chartHeight);
    const total = d3.sum(data, d => d.value);
    const centerLabel = centerText || total.toString();

    // Accessible, color-blind friendly palette
    const colors = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(d3.schemeTableau10);

    // Pie and arc generators
    const pie = d3
      .pie<PieData>()
      .value(d => d.value)
      .sort(null);
    const arc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(showTotal ? radius / 2 : 0)
      .outerRadius(radius);
    const outerArc = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);

    // Setup SVG with pronounced emboss filter and overflow visible
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${svgWidth} ${svgHeight / 2}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', '100%')
      .style('overflow', 'visible');

    // Define emboss filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'emboss');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');
    filter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', -2)
      .attr('dy', -2)
      .attr('result', 'offsetBlur');
    filter
      .append('feSpecularLighting')
      .attr('in', 'blur')
      .attr('surfaceScale', 4)
      .attr('specularConstant', 1)
      .attr('specularExponent', 30)
      .attr('lighting-color', '#ffffff')
      .append('fePointLight')
      .attr('x', -5000)
      .attr('y', -10000)
      .attr('z', 20000);
    filter
      .append('feComposite')
      .attr('in', 'specOut')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'in')
      .attr('result', 'specOut');
    filter
      .append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'specOut')
      .attr('operator', 'arithmetic')
      .attr('k1', 0)
      .attr('k2', 1)
      .attr('k3', 1)
      .attr('k4', 0);

    svg.selectAll('*:not(defs)').remove();

    // Main chart group
    const chartGroup = svg
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left + chartWidth / 2}, ${margin.top + chartHeight / 2})`
      );

    const sliceData = pie(data);

    // Draw slices with emboss effect
    const slices = chartGroup
      .selectAll('path')
      .data(sliceData)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colors(d.data.name))
      .attr('stroke', theme.palette.divider)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#emboss)')
      .each(function(d) {
        (this as any)._current = d;
      })
      .on('mouseover', (event, d) => {
        const tooltipEl = tooltipRef.current;
        const containerEl = svgRef.current?.parentElement;
        if (!tooltipEl || !containerEl) return;

        const containerRect = containerEl.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltipEl.style.left = `${mouseX + 10}px`;
        tooltipEl.style.top = `${mouseY + 10}px`;
        tooltipEl.style.opacity = '1';
        tooltipEl.innerHTML = `
    <strong>${d.data.name}</strong>: ${d.data.value} (${((d.data.value / total) * 100).toFixed(1)}%)
  `;
      })
      .on('mousemove', event => {
        const tooltipEl = tooltipRef.current;
        const containerEl = svgRef.current?.parentElement;
        if (!tooltipEl || !containerEl) return;

        const containerRect = containerEl.getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;

        tooltipEl.style.left = `${mouseX + 10}px`;
        tooltipEl.style.top = `${mouseY + 10}px`;
      })
      .on('mouseout', () => {
        const tooltipEl = tooltipRef.current;
        if (!tooltipEl) return;
        tooltipEl.style.opacity = '0';
      });

    // Animate slices
    slices
      .transition()
      .duration(800)
      .attrTween('d', function(d) {
        const interpolator = d3.interpolate((this as any)._current, d);
        (this as any)._current = interpolator(0);
        return t => arc(interpolator(t))!;
      });

    // Center label with actual total
    if (showTotal) {
      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', largerRem)
        .attr('stroke', theme.palette.text.primary)
        .attr('text-wrap', radius * 1.2)
        .text(centerLabel);
    }

    // Annotations with larger label font
    chartGroup
      .selectAll('polyline')
      .data(sliceData)
      .enter()
      .append('polyline')
      .attr('points', d => {
        const p = arc.centroid(d);
        const op = outerArc.centroid(d);
        const mid = (d.startAngle + d.endAngle) / 2;
        op[0] = radius * 1.3 * (mid < Math.PI ? 1 : -1);
        return [p, outerArc.centroid(d), op] as any;
      })
      .attr('fill', 'none')
      .attr('stroke', theme.palette.text.primary)
      .attr('stroke-width', 1.5);

    chartGroup
      .selectAll('text.label')
      .data(sliceData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const mid = (d.startAngle + d.endAngle) / 2;
        pos[0] = radius * 1.4 * (mid < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('text-anchor', d => ((d.startAngle + d.endAngle) / 2 < Math.PI ? 'start' : 'end'))
      .attr('dy', '0.35em')
      .attr('font-size', theme.typography.fontSize)
      .attr('stroke', theme.palette.text.primary)
      .attr('font-weight', 'normal')
      .attr('text-wrap', radius * 1.2)
      .attr('lengthAdjust', 'spacingAndGlyphs')
      .text(d => `${d.data.name} (${((d.data.value / total) * 100).toFixed(1)}%)`)
      .call(wrapText, 100);
  }, [data, showTotal, centerText, themeMode]);

  return (
    <div
      style={{
        position: 'relative',
        width: `100%`,
        height: `100%`,
        overflow: 'visible'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <svg ref={svgRef} role="img"></svg>
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.divider}`,
            padding: '8px',
            borderRadius: '4px',
            boxShadow: theme.shadows[3],
            pointerEvents: 'none',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            fontSize: theme.typography.fontSize,
            zIndex: 10
          }}
        ></div>
      </div>
    </div>
  );
};

export default D3PieChart;
