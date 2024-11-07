import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import EditIcon from '../../../components/icon/editIcon/editIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Target from '../../../utils/types/target';

interface GridTargetsProps {
  deleteClicked?: Function;
  editClicked?: Function;
  height?: number;
  raType: number;
  rowClick?: Function;
  rows?: Target[];
}

export default function GridTargets({
  deleteClicked = null,
  editClicked = null,
  height = 171,
  raType = 1,
  rowClick = null,
  rows = []
}: GridTargetsProps) {
  const { t } = useTranslation('pht');

  const basicColumns = [
    { field: 'name', headerName: t('name.label'), flex: 3 },
    { field: 'ra', headerName: t('skyDirection.label.1.' + raType), flex: 3 },
    { field: 'dec', headerName: t('skyDirection.label.2.' + raType), flex: 3 },
    {
      field: 'vel',
      headerName: t('velocity.0'),
      flex: 2,
      disableClickEventBubbling: true,
      renderCell: (e: { row: Target }) => {
        if (e.row.vel === null || e.row.vel === '') {
          return null;
        }
        const units = e.row.velUnit === 1 ? 1 : 0;
        return e.row.vel + ' ' + t('velocity.units.' + units);
      }
    },
    { field: 'redshift', headerName: t('velocity.1'), flex: 2 }
  ];

  const actionColumns = [
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions.label'),
      sortable: false,
      flex: 2,
      disableClickEventBubbling: true,
      renderCell: (e: any) => {
        const rec: Target = e.row;
        return (
          <>
            {editClicked !== null && (
              <EditIcon onClick={() => editClicked(rec)} toolTip={t('editTarget.toolTip')} />
            )}
            {deleteClicked !== null && (
              <TrashIcon onClick={() => deleteClicked(rec)} toolTip={t('deleteTarget.toolTip')} />
            )}
          </>
        );
      }
    }
  ];

  const getColumns = () =>
    deleteClicked !== null || editClicked !== null
      ? [...basicColumns, ...actionColumns]
      : [...basicColumns];

  return (
    <>
      {rows.length > 0 && (
        <DataGrid
          rows={rows}
          columns={getColumns()}
          height={height}
          onRowClick={rowClick}
          testId="targetListColumns"
        />
      )}
      {!rows ||
        (rows.length === 0 && (
          <Alert color={AlertColorTypes.Error} text={t('targets.empty')} testId="helpPanelId" />
        ))}
    </>
  );
}