import React from 'react';
import { Table, TableBody } from '@mui/material';
import TableContainer from '../tableContainer/TableContainer';
import TableCalibrationsHeader from './tableCalibrationsHeader/TableCalibrationsHeader';
import TableCalibrationsRow from './tableCalibrationsRow/TableCalibrationsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface TableCalibrationsProps {
  data: any;
  deleteFunction?: (item: any) => void;
  updateFunction: (item: any) => void;
}

export default function TableCalibrations({
  data,
  deleteFunction,
  updateFunction
}: TableCalibrationsProps) {
  const { t } = useScopedTranslation();

  const expandButtonRefs = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [expandedRows, setExpandedRows] = React.useState(new Set<number>());

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  return (
    <TableContainer>
      <Table aria-label="Data Products Table" sx={{ tableLayout: 'auto', width: '100%' }}>
        {<TableCalibrationsHeader />}
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
        </colgroup>

        <TableBody>
          {data?.map((item: any, index: number) => (
            <TableCalibrationsRow
              key={item.id}
              item={item}
              index={index}
              expanded={expandedRows.has(item.id)}
              toggleRow={toggleRow}
              expandButtonRef={el => (expandButtonRefs.current[item.id] = el)}
              deleteClicked={deleteFunction}
              editClicked={updateFunction}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
