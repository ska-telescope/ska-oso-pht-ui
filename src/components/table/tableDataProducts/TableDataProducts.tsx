import React from 'react';
import { Table, TableBody } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import TableContainer from '../tableContainer/TableContainer';
import TableDataProductsHeader from './tableDataProductsHeader/TableDataProductsHeader';
import TableDataProductsRow from './tableDataProductsRow/TableDataProductsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Proposal from '@/utils/types/proposal';

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
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

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
              proposal={getProposal()}
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
