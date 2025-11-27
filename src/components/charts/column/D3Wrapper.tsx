import React, { useState, useMemo, useRef, useEffect } from 'react';
import D3ColumnChart from './D3ColumnChartNew';
import { getColors } from '@/utils/colors/colors';

type Datum = Record<string, string | number | null | undefined>;

type WrapperProps = {
  data: Datum[];
  fields: string[];
};

const PADDING = 60;

const ColumnChartWrapper: React.FC<WrapperProps> = ({ data, fields }) => {
  const safeFields = useMemo(() => fields.filter(Boolean), [fields]);
  const [xField, setXField] = useState(safeFields[0] ?? '');
  const [groupField, setGroupField] = useState('');

  // measure the actual chart area (yellow box)
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!chartAreaRef.current) return;
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({
        width: rect.width,
        height: rect.height
      });
    });
    observer.observe(chartAreaRef.current);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (!xField) return [];
    if (!groupField) {
      const counts: Record<string, number> = {};
      data.forEach(d => {
        const key = String(d[xField] ?? '∅');
        counts[key] = (counts[key] ?? 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    } else {
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

  const getGroupColorType = () => {
    switch (groupField) {
      case 'reviewStatus':
        return 'reviewstatus';
      case 'assignedProposal':
        return 'boolean';
      case 'array':
        return 'telescope';
      case 'scienceCategory':
        return 'observationType';
      default:
        return 'observationType';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '0.5rem',
          paddingLeft: '1rem'
        }}
      >
        <label>
          X-axis:
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
        </label>

        <label>
          Group by:
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
        </label>
      </div>

      <div ref={chartAreaRef} style={{ padding: PADDING, flex: 1, minHeight: 0 }}>
        {size.width > 0 && size.height > 0 && (
          <D3ColumnChart
            data={chartData}
            chartColors={getColors({
              type: getGroupColorType(),
              colors: '',
              content: 'bg'
            })}
            width={size.width}
            height={size.height - PADDING}
          />
        )}
      </div>
    </div>
  );
};

export default ColumnChartWrapper;
