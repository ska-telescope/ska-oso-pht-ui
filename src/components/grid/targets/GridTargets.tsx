import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import EditIcon from '../../../components/icon/editIcon/editIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Target, { Beam } from '../../../utils/types/target';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface GridTargetsProps {
  deleteClicked?: Function;
  editClicked?: Function;
  height?: number | string;
  raType: number;
  rowClick?: Function;
  rows?: Target[];
}

export default function GridTargets({
  deleteClicked,
  editClicked,
  height = 171,
  raType,
  rowClick,
  rows = []
}: GridTargetsProps) {
  const loggedIn = isLoggedIn();
  const { t } = useScopedTranslation();

  const basicColumns = [
    { field: 'name', headerName: t('name.label'), flex: 2 },
    { field: 'raStr', headerName: t('skyDirection.short.1.' + raType), width: 120 },
    { field: 'decStr', headerName: t('skyDirection.short.2.' + raType), width: 120 },
    {
      field: 'vel',
      headerName: t('velocity.0'),
      width: 160,
      disableClickEventBubbling: true,
      renderCell: (e: { row: Target }) => {
        if (e.row.vel === null || e.row.vel === '') {
          return null;
        }
        const units = e.row.velUnit === 1 ? 1 : 0;
        return e.row.vel + ' ' + t('velocity.units.' + units);
      }
    },
    {
      field: 'redshift',
      headerName: t('velocity.1'),
      width: 160,
      disableClickEventBubbling: true
    },
    {
      field: 'beamName',
      headerName: t('pstBeam.label'),
      flex: 3,
      renderCell: (e: { row: Target }) => {
        // console.log('/////// e.row.tiedArrayBeams', e.row.tiedArrayBeams?.pstBeams);
        const beamNames = e.row.tiedArrayBeams?.pstBeams?.map((beam: Beam) => { return beam.beamName });
        const beamName = e.row.tiedArrayBeams?.pstBeams[0]?.beamName;
        //console.log('/////// pst beam name', beamName);
        const tiedArrayBeams = Array.isArray(e.row.tiedArrayBeams?.pstBeams)
          ? e.row.tiedArrayBeams.pstBeams
          : [];
        return tiedArrayBeams
          .map((beam: any) => (beam.beamName))
          .join(', ');
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
              <EditIcon
                onClick={() => (editClicked ? editClicked(rec) : null)}
                toolTip={t('editTarget.toolTip')}
              />
            )}
            {deleteClicked !== null && (
              <TrashIcon
                onClick={() => (deleteClicked ? deleteClicked(rec) : null)}
                toolTip={t('deleteTarget.toolTip')}
              />
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
          <Alert
            color={AlertColorTypes.Error}
            text={loggedIn ? t('targets.empty') : t('targets.loggedOut')}
            testId="helpPanelId"
          />
        ))}
    </>
  );
}
