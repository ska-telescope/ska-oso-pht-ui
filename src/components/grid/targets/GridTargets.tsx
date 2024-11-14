import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import EditIcon from '../../../components/icon/editIcon/editIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Target from '../../../utils/types/target';
import { VELOCITY_TYPE } from '../../../utils/constants';

interface GridTargetsProps {
  deleteClicked?: Function;
  editClicked?: Function;
  height?: number | string;
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
    { field: 'ra', headerName: t('skyDirection.short.1.' + raType), width: 120 },
    { field: 'dec', headerName: t('skyDirection.short.2.' + raType), width: 120 },
    {
      field: 'vel',
      headerName: t('velocityRedshift.label'),
      width: 160,
      disableClickEventBubbling: true,
      renderCell: (e: { row: Target }) => {
        const showVelocity = row =>
          t('velocity.0')[0] +
          ': ' +
          row.vel +
          ' ' +
          (row.vel ? t('velocity.units.' + row.velUnit) : '');
        const showRedshift = row => t('velocity.1')[0] + ': ' + row.redshift;
        return e.row.velType === VELOCITY_TYPE.VELOCITY ? showVelocity(e.row) : showRedshift(e.row);
      }
    }
  ];

  const actionColumns = [
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions.label'),
      sortable: false,
      width: 140,
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
