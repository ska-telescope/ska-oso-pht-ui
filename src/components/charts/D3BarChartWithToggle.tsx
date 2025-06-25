// D3BarChartWithToggle.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 50, right: 40, bottom: 100, left: 50 };

type DataRow = Record<string, any>;

type Props = {
  data: DataRow[];
  groupByOptions: string[];
  allFields: string[];
};

const D3BarChartWithToggle: React.FC<Props> = ({ data, groupByOptions, allFields }) => {
  const [groupBy, setGroupBy] = useState<string>(groupByOptions[0]);
  const [visibleFields, setVisibleFields] = useState<string[]>([...allFields]);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const renderChart = () => {
    if (!svgRef.current || !wrapperRef.current || !tooltipRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = wrapperRef.current.clientWidth * 1.5;
    const containerHeight = wrapperRef.current.clientHeight * 1.5;
    const width = containerWidth - MARGIN.left - MARGIN.right;
    const height = containerHeight - MARGIN.top - MARGIN.bottom;

    svg
      .attr('width', containerWidth)
      .attr('height', containerHeight)
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const groups = Array.from(new Set(data.map(d => d[groupBy])));
    const x0 = d3.scaleBand<string>().domain(groups).range([MARGIN.left, MARGIN.left + width]).padding(0.2);
    const x1 = d3.scaleBand<string>().domain(visibleFields).range([0, x0.bandwidth()]).padding(0.1);

    const maxValue = d3.max(groups.flatMap(group =>
      visibleFields.map(field => {
        const entries = data.filter(d => d[groupBy] === group);
        return d3.sum(entries, d => +d[field] || 0);
      })
    )) || 0;

    const y = d3.scaleLinear().domain([0, maxValue]).nice().range([MARGIN.top + height, MARGIN.top]);
    const color = d3.scaleOrdinal<string>().domain(allFields).range(d3.schemeTableau10);

    svg.append('g')
      .attr('transform', `translate(0, ${MARGIN.top + height})`)
      .call(d3.axisBottom(x0));

    svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y));

    groups.forEach(group => {
      const entries = data.filter(d => d[groupBy] === group);
      visibleFields.forEach(field => {
        const value = entries.length;
        const x = x0(group)! + x1(field)!;
        const y1 = y(value);
        const y0 = MARGIN.top + height;

        svg.append('rect')
          .attr('x', x)
          .attr('width', x1.bandwidth())
          .attr('y', y0)
          .attr('height', 0)
          .attr('fill', color(field))
          .attr('stroke', '#e5e7eb')
          .attr('stroke-width', 0.5)
          .on('mouseover', (event) => {
            const [mx, my] = d3.pointer(event, svgRef.current);
            d3.select(tooltipRef.current)
              .style('left', `${mx + 15}px`)
              .style('top', `${my + 15}px`)
              .style('opacity', 1)
              .html(`<strong>${field}</strong>: ${value}`);
          })
          .on('mouseout', () => d3.select(tooltipRef.current).style('opacity', 0))
          .transition()
          .duration(800)
          .attr('y', y1)
          .attr('height', y0 - y1);
      });
    });

    const legend = svg.append('g')
      .attr('transform', `translate(${MARGIN.left}, ${containerHeight - 40})`);

    visibleFields.forEach((field, i) => {
      const lg = legend.append('g')
        .attr('transform', `translate(${i * 120}, 0)`);
      lg.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', color(field));
      lg.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text(field)
        .attr('font-size', '12px')
        .attr('fill', '#333');
    });
  };

  useEffect(() => {
    renderChart();
  }, [data, groupBy, visibleFields]);

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          className="border px-2 py-1 rounded"
          value={groupBy}
          onChange={e => setGroupBy(e.target.value)}
        >
          {groupByOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          multiple
          className="border px-2 py-1 rounded h-24"
          value={visibleFields}
          onChange={e => {
            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
            setVisibleFields(selected);
          }}
        >
          {allFields.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
      <div ref={wrapperRef} className="relative w-full h-full min-h-[400px]">
        <svg ref={svgRef} className="w-full h-full" />
        <div
          ref={tooltipRef}
          className="absolute bg-white border border-gray-300 p-2 rounded shadow-md pointer-events-none opacity-0 transition-opacity duration-200 text-base"
        />
      </div>
    </div>
  );
};

export default D3BarChartWithToggle;
