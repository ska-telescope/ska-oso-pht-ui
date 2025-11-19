import { Box, Tooltip, Typography } from '@mui/material';
import { AlertColorTypes, DataGrid } from '@ska-telescope/ska-gui-components';
import StarIcon from '../../../components/icon/starIcon/starIcon';
import TickIcon from '../../../components/icon/tickIcon/tickIcon';
import TrashIcon from '../../../components/icon/trashIcon/trashIcon';
import Alert from '../../alerts/standardAlert/StandardAlert';
import Investigator from '../../../utils/types/investigator';
import LockIcon from '@/components/icon/lockIcon/lockIcon';
import { GRID_MEMBERS_ACTIONS } from '@/utils/constants';
import ProposalAccess from '@/utils/types/proposalAccess';
import { PROPOSAL_ACCESS_PERMISSIONS } from '@/utils/aaa/aaaUtils';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';

interface GridMembersProps {
  action?: boolean;
  actionClicked?: Function;
  height?: number;
  rowClick?: Function;
  rows?: Investigator[];
  permissions?: ProposalAccess[];
}

export default function GridMembers({
  action = false,
  actionClicked,
  height = 171,
  rowClick,
  rows = [],
  permissions = []
}: GridMembersProps) {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();

  const isPI = ({ pi }: { pi: any }) => pi;

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

  const dataDisplay = (value: string, toolTip: string, testId: string) => (
    <Box pt={2}>
      <Tooltip data-testid={testId} title={toolTip ? toolTip : ''} arrow>
        <Typography variant="subtitle2">{value}</Typography>
      </Tooltip>
    </Box>
  );

  const colLastName = {
    field: 'lastName',
    renderHeader: () => headerDisplay('lastName.label'),
    flex: 2,
    minWidth: 150,
    renderCell: (e: { row: { lastName: string } }) =>
      dataDisplay(e.row.lastName, e.row.lastName, 'lastName')
  };

  const colFirstName = {
    field: 'firstName',
    renderHeader: () => headerDisplay('firstName.label'),
    flex: 2,
    minWidth: 150,
    renderCell: (e: { row: { firstName: string } }) =>
      dataDisplay(e.row.firstName, e.row.firstName, 'firstName')
  };

  const colStatus = {
    field: 'status',
    renderHeader: () => headerDisplay('status.label'),
    flex: 1,
    minWidth: 120,
    renderCell: (e: { row: { status: string } }) =>
      dataDisplay(e.row.status, e.row.status, 'status')
  };

  const colPHD = {
    field: 'phdThesis',
    flex: 1,
    minWidth: 120,
    disableClickEventBubbling: true,
    renderHeader: () => headerDisplay('phdThesis.grid'),
    renderCell: (params: { row: { phdThesis: string; status: string } }) => (
      <PHDThesis value={params.row.phdThesis} />
    )
  };

  const colPI = {
    field: 'pi',
    sortable: false,
    flex: 1,
    minWidth: 120,
    disableClickEventBubbling: true,
    renderHeader: () => headerDisplay('pi.short'),
    renderCell: (params: { row: { pi: string; status: string } }) => <PIStar pi={params.row.pi} />
  };

  const basicColumns = [colLastName, colFirstName, colStatus, colPHD, colPI];

  const trashClicked = () => {
    if (actionClicked) actionClicked(GRID_MEMBERS_ACTIONS.delete);
  };

  const lockClicked = () => {
    if (actionClicked) actionClicked(GRID_MEMBERS_ACTIONS.access);
  };
  const colActions = [
    {
      field: 'id',
      renderHeader: () => headerDisplay('actions.label'),
      sortable: false,
      flex: 1,
      minWidth: 120,
      disableClickEventBubbling: true,
      renderCell: (params: { row: { id: string; pi: string } }) => {
        return (
          <>
            {/* Only show lock icon if the member is registered with entra id */}
            {!params.row.id.includes('temp-') && (
              <LockIcon onClick={lockClicked} toolTip={t('manageTeamMember.toolTip')} />
            )}
            <TrashIcon
              disabled={isPI({ pi: params.row.pi })}
              onClick={trashClicked}
              toolTip={t('deleteTeamMember.toolTip')}
            />
          </>
        );
      }
    }
  ];
  const colPermissions = [
    {
      field: 'permissions',
      renderHeader: () => headerDisplay('manageTeamMember.rights'),
      sortable: false,
      flex: 2,
      minWidth: 160,
      disableClickEventBubbling: true,
      renderCell: (params: any) => {
        const userAccess = permissions.find((acc: ProposalAccess) => acc.userId === params.row.id)
          ?.permissions;
        const desiredOrder = PROPOSAL_ACCESS_PERMISSIONS;
        const ordered = desiredOrder.filter(item => userAccess?.includes(item.toLowerCase()));
        const accessDisplay = ordered
          ?.map((perm: string) => {
            return t(`manageTeamMember.${perm}.short`); // TODO investigate why we need both update and edit in the translation files and and only use edit
          })
          .join(', ');
        const highestAccess = accessDisplay.split(',');
        const inValue = highestAccess ? highestAccess[highestAccess.length - 1] : '';
        const inTooltip = accessDisplay ? accessDisplay : '';
        return dataDisplay(inValue, inTooltip, 'memberAccess');
      }
    }
  ];

  const baseColumns = () => (isSV() ? [colLastName, colFirstName, colStatus] : basicColumns);
  const getColumns = () =>
    action ? [...colActions, ...baseColumns(), ...colPermissions] : [...baseColumns()];

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
