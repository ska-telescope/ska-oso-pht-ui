import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type PieData = { name: string; value: number };

type Props = {
  data: PieData[];
  showTotal?: boolean;
  centerText?: string;
};

const D3PieChart: React.FC<Props> = ({ data, showTotal = false, centerText = '' }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // Dimensions & margins
    const chartWidth = 400;
    const chartHeight = 300;
    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const svgWidth = chartWidth + margin.left + margin.right;
    const svgHeight = chartHeight + margin.top + margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
    const total = d3.sum(data, d => d.value);
    const centerLabel = centerText || total.toString();

    // Accessible, color-blind friendly palette
    const colors = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.name))
      .range(d3.schemeTableau10);

    // Pie and arc generators
    const pie = d3.pie<PieData>().value(d => d.value).sort(null);
    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(showTotal ? radius / 2 : 0)
      .outerRadius(radius);
    const outerArc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);

    // Setup SVG with pronounced emboss filter and overflow visible
    const svg = d3.select(svgRef.current)
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('overflow', 'visible');

    // Define emboss filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'emboss');
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');
    filter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', -2)
      .attr('dy', -2)
      .attr('result', 'offsetBlur');
    filter.append('feSpecularLighting')
      .attr('in', 'blur')
      .attr('surfaceScale', 4)
      .attr('specularConstant', 1)
      .attr('specularExponent', 30)
      .attr('lighting-color', '#ffffff')
      .append('fePointLight')
      .attr('x', -5000)
      .attr('y', -10000)
      .attr('z', 20000);
    filter.append('feComposite')
      .attr('in', 'specOut')
      .attr('in2', 'SourceAlpha')
      .attr('operator', 'in')
      .attr('result', 'specOut');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'specOut')
      .attr('operator', 'arithmetic')
      .attr('k1', 0)
      .attr('k2', 1)
      .attr('k3', 1)
      .attr('k4', 0);

    svg.selectAll('*:not(defs)').remove();

    // Main chart group
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left + chartWidth / 2}, ${margin.top + chartHeight / 2})`);

    const sliceData = pie(data);

    // Draw slices with emboss effect
    const slices = chartGroup.selectAll('path')
      .data(sliceData)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colors(d.data.name))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .attr('filter', 'url(#emboss)')
      .each(function (d) { (this as any)._current = d; })
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event, svg.node());
        d3.select(tooltipRef.current)
          .style('left', `${x + 15}px`)
          .style('top', `${y + 15}px`)
          .style('opacity', 1)
          .html(`<strong>${d.data.name}</strong>: ${d.data.value} (${((d.data.value / total) * 100).toFixed(1)}%)`);
      })
      .on('mousemove', event => {
        const [x, y] = d3.pointer(event, svg.node());
        d3.select(tooltipRef.current)
          .style('left', `${x + 15}px`)
          .style('top', `${y + 15}px`);
      })
      .on('mouseout', () => {
        d3.select(tooltipRef.current).style('opacity', 0);
      });

    // Animate slices
    slices.transition().duration(800).attrTween('d', function (d) {
      const interpolator = d3.interpolate((this as any)._current, d);
      (this as any)._current = interpolator(0);
      return t => arc(interpolator(t))!;
    });

    // Center label with actual total
    if (showTotal) {
      chartGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .text(centerLabel);
    }

    // Annotations with larger label font
    chartGroup.selectAll('polyline')
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
      .attr('stroke', '#666')
      .attr('stroke-width', 1.5);

    chartGroup.selectAll('text.label')
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
      .attr('text-anchor', d => ((d.startAngle + d.endAngle) / 2) < Math.PI ? 'start' : 'end')
      .attr('dy', '0.35em')
      .attr('font-size', '14px')
      .text(d => `${d.data.name} (${((d.data.value / total) * 100).toFixed(1)}%)`);

  }, [data, showTotal, centerText]);

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-300 p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 text-base"
      ></div>
    </div>
  );
};

export default D3PieChart;
