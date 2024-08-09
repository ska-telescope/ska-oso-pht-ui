import React from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon, Typography } from '@mui/material';
import { StarRateRounded } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import TeamMember from 'utils/types/teamMember';

interface GridMembersProps {
  action?: boolean;
  actionClicked?: Function;
  height?: number;
  rowClick?: Function;
  rows?: TeamMember[];
}

export default function AddButton({
  action = false,
  actionClicked = null,
  height = 171,
  rowClick = null,
  rows = []
}: GridMembersProps) {
  const { t } = useTranslation('pht');

  const PIStar = ({ pi }) => {
    if (pi) {
      return <SvgIcon component={StarRateRounded} viewBox="0 0 24 24" />;
    }
  };

  const PHDThesis = ({ value }) => {
    if (value) {
      return <SvgIcon component={CheckIcon} viewBox="0 0 24 24" />;
    }
  };

  const headerDisplay = (inValue: string) => (
    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
      {t(inValue)}
    </Typography>
  );

  const basicColumns = [
    { field: 'lastName', renderHeader: () => headerDisplay('lastName.label'), flex: 1 },
    { field: 'firstName', renderHeader: () => headerDisplay('firstName.label'), flex: 1 },
    { field: 'status', renderHeader: () => headerDisplay('status.label'), flex: 1 },
    {
      field: 'phdThesis',
      headerName: t('phdThesis.label'),
      flex: 1,
      disableClickEventBubbling: true,
      renderHeader: () => headerDisplay('phdThesis.label'),
      renderCell: (params: { row: { phdThesis: string; status: string } }) => (
        <PHDThesis value={params.row.phdThesis} />
      )
    },
    {
      field: 'pi',
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderHeader: () => headerDisplay('pi.short'),
      renderCell: (params: { row: { pi: string; status: string } }) => <PIStar pi={params.row.pi} />
    }
  ];

  const actionColumns = [
    {
      field: 'id',
      headerName: t('actions.label'),
      sortable: false,
      flex: 1,
      disableClickEventBubbling: true,
      renderCell: () => <TrashIcon onClick={actionClicked} toolTip="Delete team member" />
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
          testId="teamTableId"
        />
      )}
      {!rows ||
        (rows.length === 0 && (
          <Alert color={AlertColorTypes.Error} text={t('members.empty')} testId="helpPanelId" />
        ))}
    </>
  );
}
