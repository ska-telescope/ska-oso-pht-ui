import React, { useState, useMemo } from 'react';
import D3ColumnChart from './D3ColumnChartNew';

type Datum = Record<string, string | number | null | undefined>;

type WrapperProps = {
  data: Datum[];
  fields: string[];
  title?: string;
  chartColors?: Record<string, { bg?: string; fg?: string }> | null;
};

const ColumnChartWrapper: React.FC<WrapperProps> = ({ data, fields, chartColors }) => {
  const safeFields = useMemo(() => fields.filter(Boolean), [fields]);
  const [xField, setXField] = useState(safeFields[0] ?? '');
  const [groupField, setGroupField] = useState('');

  // Transform raw data into chart‑friendly objects
  const chartData = useMemo(() => {
    if (!xField) return [];

    if (!groupField) {
      // ungrouped: { name, value }
      const counts: Record<string, number> = {};
      data.forEach(d => {
        const key = String(d[xField] ?? '∅');
        counts[key] = (counts[key] ?? 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } else {
      // grouped: { name, group, value }
      const counts: Record<string, number> = {};
      data.forEach(d => {
        const xKey = String(d[xField] ?? '∅');
        const gKey = String(d[groupField] ?? '∅');
        const composite = `${xKey}||${gKey}`;
        counts[composite] = (counts[composite] ?? 0) + 1;
      });
      return Object.entries(counts).map(([composite, value]) => {
        const [name, group] = composite.split('||');
        return { name, group, value };
      });
    }
  }, [data, xField, groupField]);

  return (
    <div className="chart-wrapper">
      <div className="controls">
        <label>X-axis:</label>
        <select
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

        <label>Group by:</label>
        <select value={groupField} onChange={e => setGroupField(e.target.value)}>
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

      <D3ColumnChart data={chartData} chartColors={chartColors} />
    </div>
  );
};

export default ColumnChartWrapper;
