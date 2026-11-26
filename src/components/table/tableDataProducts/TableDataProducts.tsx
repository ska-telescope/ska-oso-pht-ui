import React from 'react';
import { Table, TableBody } from '@mui/material';
import TableContainer from '../tableContainer/TableContainer';
import TableDataProductsHeader from './tableDataProductsHeader/TableDataProductsHeader';
import TableDataProductsRow from './tableDataProductsRow/TableDataProductsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import type { ObservationInput } from '@/models/proposals/observations';

interface TableDataProductsProps {
  data: any;
  observations: ObservationInput[];
  deleteFunction?: (item: any) => void;
  updateFunction: (item: any) => void;
}

export default function TableDataProducts({
  data,
  observations,
  deleteFunction,
  updateFunction
}: TableDataProductsProps) {
  const { t } = useScopedTranslation();

  const expandButtonsRef = React.useRef<{ [key: number]: HTMLButtonElement | null }>({});
  const [expandedRows, setExpandedRows] = React.useState(() => new Set<number>());

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  return (
    <TableContainer>
      <Table aria-label="Data Products Table" sx={{ tableLayout: 'auto', width: '100%' }}>
        {<TableDataProductsHeader />}
        <colgroup>
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
          <col style={{ width: '5%' }} />
        </colgroup>

        <TableBody>
          {data?.map((item: any, index: number) => (
            <TableDataProductsRow
              key={item.id}
              item={item}
              observation={observations.find((obs) => obs.id === item.observationId)}
              index={index}
              expanded={expandedRows.has(item.id)}
              toggleRow={toggleRow}
              expandButtonRef={(el) => (expandButtonsRef.current[item.id] = el)}
              deleteClicked={deleteFunction}
              editClicked={updateFunction}
              t={t} // useScopedTranslation
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
