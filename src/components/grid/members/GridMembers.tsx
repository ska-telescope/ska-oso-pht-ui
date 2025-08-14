import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import StarIcon from '../../../components/icon/starIcon/starIcon';
import TickIcon from '../../../components/icon/tickIcon/tickIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Investigator from '../../../utils/types/investigator';

interface GridMembersProps {
  action?: boolean;
  actionClicked?: Function;
  height?: number;
  rowClick?: Function;
  rows?: Investigator[];
}

export default function GridMembers({
  action = false,
  actionClicked,
  height = 171,
  rowClick,
  rows = []
}: GridMembersProps) {
  const { t } = useTranslation('pht');
  const PIStar = ({ pi }: { pi: any }) => {
    if (pi) {
      return <StarIcon onClick={() => {}} />;
    }
  };

  const PHDThesis = ({ value }: { value: any }) => {
    if (value) {
      return <TickIcon onClick={() => {}} />;
    }
  };

  const headerDisplay = (inValue: string) => (
    <Typography variant="subtitle1">{t(inValue)}</Typography>
  );

  const basicColumns = [
    {
      field: 'lastName',
      renderHeader: () => headerDisplay('lastName.label'),
      flex: 2,
      minWidth: 150
    },
    {
      field: 'firstName',
      renderHeader: () => headerDisplay('firstName.label'),
      flex: 2,
      minWidth: 150
    },
    { field: 'status', renderHeader: () => headerDisplay('status.label'), flex: 1, minWidth: 120 },
    {
      field: 'phdThesis',
      headerName: t('phdThesis.label'),
      flex: 1,
      minWidth: 120,
      disableClickEventBubbling: true,
      renderHeader: () => headerDisplay('phdThesis.grid'),
      renderCell: (params: { row: { phdThesis: string; status: string } }) => (
        <PHDThesis value={params.row.phdThesis} />
      )
    },
    {
      field: 'pi',
      sortable: false,
      flex: 1,
      minWidth: 120,
      disableClickEventBubbling: true,
      renderHeader: () => headerDisplay('pi.short'),
      renderCell: (params: { row: { pi: string; status: string } }) => <PIStar pi={params.row.pi} />
    }
  ];

  const trashClicked = (row: any) => {
    if (actionClicked) actionClicked(row);
  };

  const actionColumns = [
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 1,
      minWidth: 120,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={trashClicked} toolTip="Delete team member" />
    }
  ];

  const getColumns = () => (action ? [...basicColumns, ...actionColumns] : [...basicColumns]);

  return (
    <>
      {rows.length > 0 && (
        <DataGrid
          rows={rows}
          columns={getColumns()}
          height={height}
          onRowClick={rowClick}
          testId="investigatorsTableId"
        />
      )}
      {!rows ||
        (rows.length === 0 && (
          <Alert color={AlertColorTypes.Error} text={t('members.empty')} testId="helpPanelId" />
        ))}
    </>
  );
}
