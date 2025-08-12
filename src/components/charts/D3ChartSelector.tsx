import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';

export type DataRow = Record<string, any>;

export const D3ChartSelector: React.FC<{
  data: DataRow[];
  width?: number;
  height?: number;
}> = ({ data, width = 640, height = 400 }) => {
  const allFields = useMemo(() => (data[0] ? Object.keys(data[0]) : []), [data]);
  const stringFields = allFields.filter(
    k => typeof data[0]?.[k] === 'string' || typeof data[0]?.[k] === 'boolean'
  );
  const numberFields = allFields.filter(k => typeof data[0]?.[k] === 'number');

  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [groupField, setGroupField] = useState<string>(stringFields[0] || '');
  const [valueField, setValueField] = useState<string>(numberFields[0] || '');

  const aggregated = useMemo(() => {
    if (!data.length || !groupField) return [] as KV[];

    const reducer =
      chartType === 'bar' && valueField
        ? (v: DataRow[]) => d3.mean(v, d => +d[valueField])
        : (v: DataRow[]) => v.length;

    const rollup = d3.rollup(data, reducer, d => d[groupField]);
    return Array.from(rollup, ([key, value]) => ({
      key: key as string,
      value: value as number
    }));
  }, [data, chartType, groupField, valueField]);

  if (!data.length) {
    return <div data-testid="noDataMessage">No data available</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="font-semibold">Chart Type:</label>
        <select
          data-testid="chartTypeSelect"
          value={chartType}
          onChange={e => setChartType(e.target.value as 'bar' | 'pie')}
          className="select select-bordered"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
        </select>

        <label className="font-semibold">Group&nbsp;By:</label>
        <select
          data-testid="groupFieldSelect"
          value={groupField}
          onChange={e => setGroupField(e.target.value)}
          className="select select-bordered"
        >
          {stringFields.map(f => (
            <option key={f}>{f}</option>
          ))}
        </select>

        {chartType === 'bar' && numberFields.length > 0 && (
          <>
            <label className="font-semibold">Value&nbsp;Field:</label>
            <select
              data-testid="valueFieldSelect"
              value={valueField}
              onChange={e => setValueField(e.target.value)}
              className="select select-bordered"
            >
              {numberFields.map(f => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="w-full">
        {chartType === 'bar' ? (
          <BarChart data={aggregated} width={width} height={height} />
        ) : (
          <PieChart data={aggregated} width={width} height={height} />
        )}
      </div>
    </div>
  );
};

interface KV {
  key: string;
  value: number;
}

const BarChart: React.FC<{
  data: KV[];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 } as const;
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const x = d3
      .scaleBand<string>()
      .domain(data.map(d => d.key))
      .range([0, w])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 1])
      .nice()
      .range([h, 0]);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x));

    g.append('g').call(d3.axisLeft(y));

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.key)!)
      .attr('y', h)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('fill', '#3182bd')
      .transition()
      .duration(500)
      .attr('y', d => y(d.value))
      .attr('height', d => h - y(d.value));
  }, [data, width, height]);

  return (
    <svg
      ref={ref}
      data-testid="barChartSvg"
      width={width}
      height={height}
      className="mx-auto"
      role="img"
    />
  );
};

const PieChart: React.FC<{
  data: KV[];
  width: number;
  height: number;
}> = ({ data, width, height }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2;

    const color = d3
      .scaleOrdinal<string>()
      .domain(data.map(d => d.key))
      .range(d3.schemeTableau10);

    const arc = d3
      .arc<d3.PieArcDatum<KV>>()
      .innerRadius(0)
      .outerRadius(radius - 10);

    const pie = d3
      .pie<KV>()
      .sort(null)
      .value(d => d.value);

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    g.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', d => color(d.data.key))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    const labelArc = d3
      .arc<d3.PieArcDatum<KV>>()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.6);

    g.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs')
      .text(d => d.data.key);
  }, [data, width, height]);

  return (
    <svg
      ref={ref}
      data-testid="pieChartSvg"
      width={width}
      height={height}
      className="mx-auto"
      role="img"
    />
  );
};
