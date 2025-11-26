import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';

type Datum = Record<string, string | number | null | undefined>;

type Props = {
  data: Datum[];
  title?: string;
  groupTitle?: boolean;
  yAxisLabel?: string;
  fields: string[];
  initialXField?: string;
  initialGroupField?: string; // "" or undefined means none
  width?: number;
  height?: number;
  chartColors?: string[];
};

const D3ColumnChart: React.FC<Props> = ({
  data,
  fields,
  title = '',
  groupTitle = false,
  yAxisLabel = '',
  initialXField,
  initialGroupField = '',
  width = 940,
  height = 520,
  chartColors = d3.schemeTableau10
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const barsGRef = useRef<SVGGElement | null>(null);
  const xAxisGRef = useRef<SVGGElement | null>(null);
  const yAxisGRef = useRef<SVGGElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  const safeFields = useMemo(() => (Array.isArray(fields) ? fields.filter(Boolean) : []), [fields]);

  const [xField, setXField] = useState<string>(
    initialXField && safeFields.includes(initialXField) ? initialXField : safeFields[0] ?? ''
  );
  const [groupField, setGroupField] = useState<string>(
    initialGroupField && safeFields.includes(initialGroupField) ? initialGroupField : ''
  );

  useEffect(() => {
    if (!safeFields.length) {
      setXField('');
      setGroupField('');
      return;
    }
    if (!safeFields.includes(xField)) setXField(safeFields[0]);
    if (groupField && !safeFields.includes(groupField)) setGroupField('');
    if (groupField && groupField === xField) setGroupField('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeFields.join('|')]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    if (!barsGRef.current || !xAxisGRef.current || !yAxisGRef.current) {
      const gRoot = svg
        .select<SVGGElement>('g.g-root')
        .data([null])
        .join('g')
        .attr('class', 'g-root');
      const gBars = gRoot
        .select<SVGGElement>('g.bars')
        .data([null])
        .join('g')
        .attr('class', 'bars');
      const gX = gRoot
        .select<SVGGElement>('g.axis.x')
        .data([null])
        .join('g')
        .attr('class', 'axis x');
      const gY = gRoot
        .select<SVGGElement>('g.axis.y')
        .data([null])
        .join('g')
        .attr('class', 'axis y');

      barsGRef.current = gBars.node();
      xAxisGRef.current = gX.node();
      yAxisGRef.current = gY.node();

      // Emboss filter (used ONLY on bars)
      const defs = svg.select('defs').empty() ? svg.append('defs') : svg.select('defs');
      const filter = defs.select('#emboss').empty()
        ? defs.append('filter').attr('id', 'emboss')
        : defs.select('#emboss');
      filter.selectAll('*' as any).remove();
      filter
        .append('feDropShadow')
        .attr('dx', 0.9)
        .attr('dy', 1.6)
        .attr('stdDeviation', 1.0)
        .attr('flood-color', 'black')
        .attr('flood-opacity', 0.38);
      filter
        .append('feDropShadow')
        .attr('dx', -0.8)
        .attr('dy', -0.8)
        .attr('stdDeviation', 0.8)
        .attr('flood-color', 'white')
        .attr('flood-opacity', 0.65);
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current || !barsGRef.current || !xAxisGRef.current || !yAxisGRef.current) return;
    if (!xField || !safeFields.includes(xField)) return;

    const margin = { top: 52, right: 20, bottom: 56, left: 64 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg
      .select<SVGGElement>('g.g-root')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    const gBars = d3.select(barsGRef.current);
    const gX = d3.select(xAxisGRef.current).attr('transform', `translate(0,${innerH})`);
    const gY = d3.select(yAxisGRef.current);

    const darker = (hex: string, k = 0.6) =>
      d3
        .color(hex)!
        .darker(k)
        .formatHex();
    const withHeadroom = (maxVal: number, pad = 0.1) => (maxVal <= 0 ? 1 : maxVal * (1 + pad));

    // clear bars + legend each render
    gBars.selectAll('*').remove();
    if (legendRef.current) {
      legendRef.current.innerHTML = '';
      legendRef.current.style.display = 'none';
    }

    if (!groupField) {
      // Single series
      const grouped = d3
        .rollups(
          data,
          v => v.length,
          d => (d[xField] as string) ?? '∅'
        )
        .map(([k, v]) => ({ key: k ?? '∅', value: v }))
        .sort((a, b) => d3.descending(a.value, b.value));

      const x = d3
        .scaleBand<string>()
        .domain(grouped.map(d => d.key))
        .range([0, innerW])
        .padding(0.12);

      const maxY = d3.max(grouped, d => d.value) || 1;
      const y = d3
        .scaleLinear()
        .domain([0, withHeadroom(maxY, 0.1)])
        .nice()
        .range([innerH, 0]);

      const color = d3
        .scaleOrdinal<string, string>()
        .domain(grouped.map(d => d.key))
        .range(chartColors);

      gX.transition()
        .duration(450)
        .call(d3.axisBottom(x) as any)
        .selectAll('text')
        .attr('transform', 'rotate(-24)')
        .style('text-anchor', 'end');
      gY.transition()
        .duration(450)
        .call(d3.axisLeft(y).ticks(7) as any)
        .call(g => g.select('.domain').remove());

      const cat = gBars
        .selectAll<SVGGElement, typeof grouped[number]>('g.cat')
        .data(grouped, (d: any) => d.key)
        .enter()
        .append('g')
        .attr('class', 'cat');

      cat
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.key)!)
        .attr('y', y(0))
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => color(d.key)) // matte fill
        .attr('stroke', d => darker(color(d.key))) // subtle edge
        .attr('stroke-width', 0.8)
        .attr('filter', 'url(#emboss)') // emboss ONLY on bars
        .on('mousemove', (event, d) => {
          const tip = document.getElementById('__d3_tip__');
          const svgEl = svgRef.current;
          if (!tip || !svgEl) return;
          const card = svgEl.closest('.chart-card') as HTMLElement;
          const rect = card?.getBoundingClientRect();
          if (!rect) return;
          const xPos = event.clientX - rect.left;
          const yPos = event.clientY - rect.top;
          tip.style.opacity = '1';
          tip.innerHTML = `<b>${d.key}</b><br/>Count: ${d.value}`;
          tip.style.left = `${xPos + 10}px`;
          tip.style.top = `${yPos - 18}px`;
        })
        .on('mouseleave', () => {
          const tip = document.getElementById('__d3_tip__');
          if (tip) tip.style.opacity = '0';
        })
        .transition()
        .duration(800)
        .attr('y', d => y(d.value))
        .attr('height', d => y(0) - y(d.value));

      cat
        .append('text')
        .attr('class', 'lbl')
        .attr('x', d => x(d.key)! + x.bandwidth() / 2)
        .attr('y', y(0) - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#2e2e2e')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .transition()
        .duration(800)
        .attr('y', d => y(d.value) - 8)
        .tween('text', function(d) {
          const i = d3.interpolateNumber(0, d.value);
          return t => ((this as any).textContent = Math.round(i(t)));
        });
    } else {
      // Grouped
      if (!safeFields.includes(groupField) || groupField === xField) return;

      const xGroups = d3.groups(data, d => (d[xField] as string) ?? '∅');
      const seriesKeys = Array.from(
        new Set(data.map(d => d[groupField] as string).filter(v => v != null))
      );

      const grouped = xGroups.map(([xKey, rows]) => {
        const counts = d3.rollups(
          rows,
          v => v.length,
          d => (d[groupField] as string) ?? '∅'
        );
        const byKey = new Map(counts);
        return {
          key: xKey ?? '∅',
          series: seriesKeys.map(sk => ({ sKey: sk ?? '∅', value: (byKey.get(sk) as number) || 0 }))
        };
      });

      const x0 = d3
        .scaleBand<string>()
        .domain(grouped.map(d => d.key))
        .range([0, innerW])
        .padding(0.12);

      const x1 = d3
        .scaleBand<string>()
        .domain(seriesKeys)
        .range([0, x0.bandwidth()])
        .padding(0.08);

      const rawMax = d3.max(grouped, d => d3.max(d.series, s => s.value)) || 1;
      const y = d3
        .scaleLinear()
        .domain([0, withHeadroom(rawMax, 0.1)])
        .nice()
        .range([innerH, 0]);

      const color = d3
        .scaleOrdinal<string, string>()
        .domain(seriesKeys)
        .range(chartColors);

      gX.transition()
        .duration(450)
        .call(d3.axisBottom(x0) as any)
        .selectAll('text')
        .attr('transform', 'rotate(-24)')
        .style('text-anchor', 'end');
      gY.transition()
        .duration(450)
        .call(d3.axisLeft(y).ticks(7) as any)
        .call(g => g.select('.domain').remove());

      const cat = gBars
        .selectAll<SVGGElement, typeof grouped[number]>('g.cat')
        .data(grouped, (d: any) => d.key)
        .enter()
        .append('g')
        .attr('class', 'cat')
        .attr('transform', d => `translate(${x0(d.key)},0)`);

      cat
        .selectAll('rect.bar')
        .data(
          d => d.series,
          (s: any) => s.sKey
        )
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', s => x1(s.sKey)!)
        .attr('y', y(0))
        .attr('width', x1.bandwidth())
        .attr('height', 0)
        .attr('fill', s => color(s.sKey)) // matte
        .attr('stroke', s => darker(color(s.sKey))) // subtle edge
        .attr('stroke-width', 0.8)
        .attr('filter', 'url(#emboss)') // emboss ONLY on bars
        .on('mousemove', (event, s) => {
          const tip = document.getElementById('__d3_tip__');
          const svgEl = svgRef.current;
          if (!tip || !svgEl) return;
          const card = svgEl.closest('.chart-card') as HTMLElement;
          const rect = card?.getBoundingClientRect();
          if (!rect) return;
          const xPos = event.clientX - rect.left;
          const yPos = event.clientY - rect.top;
          tip.style.opacity = '1';
          tip.innerHTML = `<b>${s.sKey}</b><br/>Count: ${s.value}`;
          tip.style.left = `${xPos + 10}px`;
          tip.style.top = `${yPos - 18}px`;
        })
        .on('mouseleave', () => {
          const tip = document.getElementById('__d3_tip__');
          if (tip) tip.style.opacity = '0';
        })
        .transition()
        .duration(800)
        .attr('y', s => y(s.value))
        .attr('height', s => y(0) - y(s.value));

      // Legend
      if (legendRef.current) {
        legendRef.current.style.display = 'flex';
        legendRef.current.innerHTML = '';
        seriesKeys.forEach(sk => {
          const item = document.createElement('div');
          item.className = 'legend-item';
          const sw = document.createElement('div');
          sw.className = 'legend-swatch';
          sw.style.background = color(sk);
          const txt = document.createElement('span');
          txt.textContent = sk;
          item.appendChild(sw);
          item.appendChild(txt);
          legendRef.current!.appendChild(item);
        });
      }
    }
  }, [data, xField, groupField, width, height, safeFields.join('|')]);

  const yLabelTransform = `translate(24px, ${height / 2}px) rotate(-90deg)`;

  return (
    <div className="wrap">
      {title && <h2 className="page-title">{title}</h2>}

      <div className="panel">
        <div className="controls">
          <label htmlFor="xField">X-axis (category):</label>
          <select
            id="xField"
            value={xField}
            onChange={e => {
              const next = e.target.value;
              setXField(next);
              if (groupField === next) setGroupField('');
            }}
          >
            {safeFields.map(f => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <label htmlFor="groupField">Group by (series):</label>
          <select id="groupField" value={groupField} onChange={e => setGroupField(e.target.value)}>
            <option value="">(none)</option>
            {safeFields
              .filter(f => f !== xField)
              .map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
          </select>
        </div>

        <div className="chart-card">
          {groupTitle && (
            <div className="title" id="title">
              {groupField ? `Count by ${xField} (grouped by ${groupField})` : `Count by ${xField}`}
            </div>
          )}

          {/* Y-axis label (Count) */}
          <div className="y-label" style={{ transform: yLabelTransform }}>
            {yAxisLabel}
          </div>

          {/* Tooltip element */}
          <div id="__d3_tip__" className="tooltip" />

          <svg
            ref={svgRef}
            width="100%"
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g className="g-root" />
            <g ref={xAxisGRef as any} className="axis x" />
            <g ref={yAxisGRef as any} className="axis y" />
            <g ref={barsGRef as any} className="bars" />
          </svg>

          <div ref={legendRef} className="legend" style={{ display: 'none' }} />
        </div>
      </div>

      <style>{`
        :root { --ink:#333; --ink-soft:#666; }
        .wrap { max-width: 980px; margin: 28px auto; padding: 0 16px; color: var(--ink); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; }

        /* Remove double-card look — transparent backgrounds, no drop-shadows */
        .panel {
          background: transparent;
          border-radius: 0;
          padding: 8px 0 0;
          box-shadow: none;
          border: none;
        }

        .controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin: 8px 0 12px; }
        .controls label { font-size: 14px; color: var(--ink-soft); }
        select {
          padding:8px 12px; border-radius:10px; border:1px solid #d9d9d9; background:#fff;
        }

        .chart-card {
          position: relative;
          overflow: visible; /* allow tooltip to float */
          background: transparent;  /* no background card */
          border-radius: 0;
          padding: 0;               /* remove inner card padding */
          box-shadow: none;         /* remove matte/shadow from container */
          border: none;
        }

        .title { text-align:center; font-weight:700; margin: 4px 0 24px; color:#444; letter-spacing:.2px; }

        /* Keep axes minimal; no matte/shadow effects here */
        .axis text { fill:#444; font-size:11px; }
        .axis path, .axis line { stroke:#cfcfcf; }

        /* Bars keep the emboss + matte edge */
        .bar { shape-rendering: crispEdges; }

        /* Tooltip stays clean; no emboss here */
        .tooltip {
          position: absolute; pointer-events: none; background: rgba(0,0,0,.84); color:#fff;
          padding:6px 8px; border-radius:10px; font-size:12px; line-height:1.2;
          white-space: nowrap; box-shadow: 0 6px 16px rgba(0,0,0,.25); opacity: 0; transition: opacity .15s ease-out;
          z-index: 20;
        }

        .y-label {
          position: absolute; left: 0; top: 0;
          width: 0; height: 0; color: #444; font-size: 12px; font-weight: 700;
          transform-origin: left center; pointer-events: none;
        }

        /* Legend — flat, no emboss */
        .legend {
          display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:center;
          margin-top:4px;
        }
        .legend-item { display:flex; align-items:center; gap:6px; font-size:12px; color:#444; }
        .legend-swatch { width:14px; height:14px; border-radius:4px; border:1px solid rgba(0,0,0,.25); }
      `}</style>
    </div>
  );
};

export default D3ColumnChart;
