import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type DataRow = Record<string, any>;
type Props = {
  data: DataRow[];
  category: string;
  fields: string[];
};

const D3BarChart: React.FC<Props> = ({ data, category, fields }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // dimensions
    const margin = { top: 50, right: 40, bottom: 50, left: 50 };
    const fullWidth = 500;
    const fullHeight = 300;
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    // responsive SVG
    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    // dynamic sizes
    const rectSize = Math.min(width, height) * 0.04;
    const fontSize = rectSize * 0.8;
    const legendSpacing = rectSize * 6;

    // color scale
    const color = d3
      .scaleOrdinal<string>()
      .domain(fields)
      .range(d3.schemeTableau10);

    // scales
    const groups = Array.from(new Set(data.map(d => d[category])));
    const x0 = d3
      .scaleBand<string>()
      .domain(groups)
      .range([margin.left, margin.left + width])
      .padding(0.2);
    const x1 = d3
      .scaleBand<string>()
      .domain(fields)
      .range([0, x0.bandwidth()])
      .padding(0.1);
    const maxValue = d3.max(data, d => Math.max(...fields.map(f => +d[f] || 0))) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([margin.top + height, margin.top]);

    // emboss filter (reduced intensity)
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'emboss-bar');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 1)
      .attr('result', 'blur');
    filter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', -0.5)
      .attr('dy', -0.5)
      .attr('result', 'offsetBlur');
    filter
      .append('feSpecularLighting')
      .attr('in', 'blur')
      .attr('surfaceScale', 1.5)
      .attr('specularConstant', 0.8)
      .attr('specularExponent', 10)
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

    // centered legend (scales with container)
    const legendWidth = fields.length * legendSpacing;
    const legendGroup = svg
      .append('g')
      .attr('transform', `translate(${(fullWidth - legendWidth) / 2}, ${margin.top / 2})`);
    fields.forEach((field, i) => {
      const lg = legendGroup.append('g').attr('transform', `translate(${i * legendSpacing},0)`);
      lg.append('rect')
        .attr('width', rectSize)
        .attr('height', rectSize)
        .attr('fill', color(field));
      lg.append('text')
        .attr('x', rectSize + rectSize * 0.3)
        .attr('y', rectSize)
        .attr('font-size', `${fontSize}px`)
        .text(field.charAt(0).toUpperCase() + field.slice(1));
    });

    // axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${margin.top + height})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('font-size', `${fontSize}px`);

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('font-size', `${fontSize}px`);

    // bars & labels
    groups.forEach((grp, gi) => {
      fields.forEach((field, fi) => {
        const entry = data.find(d => d[category] === grp);
        const value = entry ? +entry[field] || 0 : 0;
        const x = x0(grp)! + x1(field)!;
        const y0 = margin.top + height;
        const y1 = y(value);

        svg
          .append('rect')
          .attr('x', x)
          .attr('width', x1.bandwidth())
          .attr('y', y0)
          .attr('height', 0)
          .attr('fill', color(field))
          .attr('filter', 'url(#emboss-bar)')
          .on('mouseover', event => {
            const [mx, my] = d3.pointer(event, svgRef.current);
            d3.select(tooltipRef.current)
              .style('left', `${mx + 15}px`)
              .style('top', `${my + 15}px`)
              .style('opacity', 1)
              .html(`<strong>${field.charAt(0).toUpperCase() + field.slice(1)}</strong>: ${value}`);
          })
          .on('mouseout', () => d3.select(tooltipRef.current).style('opacity', 0))
          .transition()
          .duration(800)
          .delay((gi * fields.length + fi) * 100)
          .attr('y', y1)
          .attr('height', y0 - y1);

        svg
          .append('text')
          .attr('x', x + x1.bandwidth() / 2)
          .attr('y', y1 - rectSize * 0.5)
          .attr('text-anchor', 'middle')
          .attr('font-size', `${fontSize}px`)
          .text(value);
      });
    });
  }, [data, category, fields]);

  return (
    <div className="relative flex justify-center w-full h-full">
      <svg ref={svgRef} className="block w-full h-full" />
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-300 p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 text-base"
      />
    </div>
  );
};

export default D3BarChart;
