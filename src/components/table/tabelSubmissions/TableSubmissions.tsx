import { Table, TableBody } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import TableContainer from '../tableContainer/TableContainer';
import TableSubmissionsHeader from './tableSubmissionsHeader/TableSubmissionsHeader';
import TableSubmissionsRow from './tableSubmissionsRow/TableSubmissionsRow';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Proposal from '@/utils/types/proposal';

interface TableSubmissionsProps {
  data: any;
  deleteFunction?: (item: any) => void;
  editFunction?: (item: any) => void;
  cloneFunction?: (item: any) => void;
  viewFunction?: (item: any) => void;
}

export default function TableSubmissions({
  data,
  deleteFunction,
  editFunction,
  cloneFunction,
  viewFunction
}: TableSubmissionsProps) {
  const { t } = useScopedTranslation();
  const { application } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;

  return (
    <TableContainer>
      <Table aria-label="Data Products Table" sx={{ tableLayout: 'auto', width: '100%' }}>
        {false && <TableSubmissionsHeader />}
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
            <TableSubmissionsRow
              key={item.id}
              item={item}
              proposal={getProposal()}
              index={index}
              deleteClicked={deleteFunction}
              editClicked={editFunction}
              cloneClicked={cloneFunction}
              viewClicked={viewFunction}
              t={t}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
