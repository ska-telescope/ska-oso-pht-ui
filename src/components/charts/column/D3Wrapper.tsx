import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Stack } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import D3ColumnChart from './D3ColumnChart';
import { getColors } from '@/utils/colors/colors';

type Datum = Record<string, string | number | null | undefined>;

type WrapperProps = {
  data: Datum[];
  fields: string[];
  t: (key: string) => string;
};

const PADDING = 60;

const ColumnChartWrapper: React.FC<WrapperProps> = ({ data, fields, t }) => {
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

  const getOptionsDropdown1 = () => {
    return safeFields.map(e => ({ label: t(e + '.label'), value: e }));
  };

  const getOptionsDropdown2 = () => {
    return [
      { label: t('none'), value: '' },
      ...safeFields
        .filter(e => e !== xField) // exclude the current xField
        .map(e => ({ label: t(e + '.label'), value: e }))
    ];
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
        <Stack direction="row" spacing={4} sx={{ mb: 1, pl: 1 }}>
          <Box sx={{ width: '30ch' }}>
            <DropDown
              value={xField}
              label={t('reviewDashboard.chart.label1')}
              options={getOptionsDropdown1()}
              required
              setValue={setXField}
              testId="wrapperDropdown1"
              fullWidth
            />
          </Box>
          <Box sx={{ width: '30ch' }}>
            <DropDown
              value={groupField}
              label={t('reviewDashboard.chart.label2')}
              options={getOptionsDropdown2()}
              required
              setValue={setGroupField}
              testId="wrapperDropdown2"
              fullWidth
            />
          </Box>
        </Stack>
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
