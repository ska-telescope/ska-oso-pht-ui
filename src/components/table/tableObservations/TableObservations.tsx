import React from 'react';
import { Table, TableBody } from '@mui/material';
import TableContainer from '../tableContainer/TableContainer';
import TableObservationsHeader from './tableObservationsHeader/TableObservationsHeader';
import TableObservationsRow from './tableObservationsRow/TableObservationsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import type { ObservationInput } from '@/models/proposals/observations';

interface TableObservationsProps {
  observations: ObservationInput[];
  deleteFunction?: (observation: ObservationInput) => void;
  updateFunction: (observation: ObservationInput) => void;
}

export default function TableObservations({
  observations,
  deleteFunction,
  updateFunction
}: TableObservationsProps) {
  const { t } = useScopedTranslation();

  const expandButtonsRef = React.useRef<{ [id: string]: HTMLButtonElement | null }>({});
  const [expandedRows, setExpandedRows] = React.useState(() => new Set<string>());

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    newExpandedRows.has(id) ? newExpandedRows.delete(id) : newExpandedRows.add(id);
    setExpandedRows(newExpandedRows);
  };

  return (
    <TableContainer>
      <Table aria-label="Data Products Table" sx={{ tableLayout: 'auto', width: '100%' }}>
        {<TableObservationsHeader />}
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
          {observations.map((observation, index) => (
            <TableObservationsRow
              key={observation.id}
              observation={observation}
              index={index}
              expanded={expandedRows.has(observation.id)}
              toggleRow={toggleRow}
              expandButtonRef={(el) => (expandButtonsRef.current[observation.id] = el)}
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
