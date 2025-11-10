import React from 'react';
import { Table, TableBody } from '@mui/material';
import TableContainer from '../tableContainer/TableContainer';
import TableDataProductsHeader from './tableDataProductsHeader/TableDataProductsHeader';
import TableDataProductsRow from './tableDataProductsRow/TableDataProductsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface TableDataProductsProps {
  data: any;
  deleteFunction?: (item: any) => void;
  updateFunction: (item: any) => void;
}

export default function TableDataProducts({
  data,
  deleteFunction,
  updateFunction
}: TableDataProductsProps) {
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
      <Table aria-label="Data Products Table">
        <TableDataProductsHeader />
        <TableBody>
          {data?.map((item: any, index: number) => (
            <TableDataProductsRow
              key={item.id}
              item={item}
              index={index}
              expanded={expandedRows.has(item.id)}
              toggleRow={toggleRow}
              expandButtonRef={el => (expandButtonRefs.current[item.id] = el)}
              deleteClicked={deleteFunction}
              updateItem={updateFunction}
              tableLength={data.length}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
