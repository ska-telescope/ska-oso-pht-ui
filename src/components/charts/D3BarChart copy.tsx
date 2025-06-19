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
    const fullWidth = 600;
    const fullHeight = 350;
    const width = fullWidth - margin.left - margin.right;
    const height = fullHeight - margin.top - margin.bottom;

    // responsive SVG
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    svg.selectAll('*').remove();

    const rectSize = Math.min(width, height) * 0.04;
    const fontSize = rectSize * 0.8;
    const legendSpacing = rectSize * 6;

    // tableau 10 color scale
    const color = d3.scaleOrdinal<string>()
      .domain(fields)
      .range(d3.schemeTableau10);

    // scales
    const groups = Array.from(new Set(data.map(d => d[category])));
    const x0 = d3.scaleBand<string>()
      .domain(groups)
      .range([margin.left, margin.left + width])
      .padding(0.2);
    const x1 = d3.scaleBand<string>()
      .domain(fields)
      .range([0, x0.bandwidth()])
      .padding(0.1);
    const maxValue = d3.max(data, d => Math.max(...fields.map(f => +d[f] || 0))) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxValue])
      .nice()
      .range([margin.top + height, margin.top]);

    // matte-like filter (subtle shadows)
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'matte-bar');
    filter.append('feDropShadow')
      .attr('dx', '0')
      .attr('dy', '1')
      .attr('stdDeviation', '1')
      .attr('flood-color', '#999')
      .attr('flood-opacity', '0.4');

    // legend
    const legendWidth = fields.length * legendSpacing;
    const legendGroup = svg.append('g')
      .attr('transform', `translate(${(fullWidth - legendWidth) / 2}, ${margin.top / 2})`);
    fields.forEach((field, i) => {
      const lg = legendGroup.append('g')
        .attr('transform', `translate(${i * legendSpacing},0)`);
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
    svg.append('g')
      .attr('transform', `translate(0, ${margin.top + height})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .attr('font-size', `${fontSize}px`);

    svg.append('g')
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

        svg.append('rect')
          .attr('x', x)
          .attr('width', x1.bandwidth())
          .attr('y', y0)
          .attr('height', 0)
          .attr('fill', color(field))
          .attr('filter', 'url(#matte-bar)')
          .on('mouseover', (event) => {
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

        svg.append('text')
          .attr('x', x + x1.bandwidth() / 2)
          .attr('y', y1 - rectSize * 0.5)
          .attr('text-anchor', 'middle')
          .attr('font-size', `${fontSize}px`)
          .text(value);
      });
    });

  }, [data, category, fields]);

  return (
    <div className="relative flex justify-between items-start w-full h-full gap-4 p-2">
      <svg ref={svgRef} className="w-[70%] h-full" />
      <div
        ref={tooltipRef}
        className="absolute bg-white border border-gray-300 p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200 text-base"
      />
    </div>
  );
};

export default D3BarChart;
