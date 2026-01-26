import { TableRow, TableCell, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { getColors } from '@ska-telescope/ska-gui-components';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import CloneIcon from '@/components/icon/cloneIcon/cloneIcon';
import EditIcon from '@/components/icon/editIcon/editIcon';
import TrashIcon from '@/components/icon/trashIcon/trashIcon';
import { useInitializeAccessStore } from '@/utils/aaa/aaaUtils';
import { accessUpdate } from '@/utils/aaa/aaaUtils';
import Proposal from '@/utils/types/proposal';
import { NOT_SPECIFIED, PROPOSAL_STATUS } from '@/utils/constants';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { ProposalAccess } from '@/utils/types/proposalAccess';
import { presentDate, presentDateTime } from '@/utils/present/present';

interface TableSubmissionsRowProps {
  item: any;
  index: number;
  proposal: Proposal;
  deleteClicked?: Function;
  editClicked?: Function;
  cloneClicked?: Function;
  viewClicked?: Function;
  t: any;
}

export default function TableSubmissionsRow({
  item,
  index,
  deleteClicked,
  editClicked,
  cloneClicked,
  viewClicked,
  t
}: TableSubmissionsRowProps) {
  const theme = useTheme();
  const { getCycle } = useOSDAccessors();
  const getAccess = () => application.content4 as ProposalAccess[];
  const { application } = storageObject.useStore();
  const cycleInfo = getCycle(item.cycle || '');

  useInitializeAccessStore();

  const canEdit = (item: any) => item.status === PROPOSAL_STATUS.DRAFT;

  const canClone = (item: { id: string }) => {
    const update = accessUpdate(getAccess(), item.id);
    return update;
  };

  const canDelete = (item: { status: string }) =>
    item.status === PROPOSAL_STATUS.DRAFT || item.status === PROPOSAL_STATUS.WITHDRAWN;

  const getStatusColor = (status: string) => {
    const colors = getColors({
      type: 'proposalStatus',
      colors: status,
      asArray: true,
      paletteIndex: Number(localStorage.getItem('skao_accessibility_mode')),
      dim: 0.5
    });
    return colors;
  };

  return (
    <>
      <TableRow
        key={item.id}
        data-testid={`row-${item.id}`}
        sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        role="row"
        aria-rowindex={index + 2}
      >
        <TableCell role="gridcell" sx={{ maxWidth: 200, p: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            {editClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <EditIcon
                  onClick={() => editClicked(item.id)}
                  disabled={!canEdit(item)}
                  toolTip={t(canEdit(item) ? 'editProposal.toolTip' : 'editProposal.disabled')}
                />
                <Typography variant="caption">{t('edit.label')}</Typography>
              </Box>
            )}
            {viewClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <ViewIcon
                  onClick={() => viewClicked(item.id)}
                  toolTip={t('viewProposal.toolTip')}
                />
                <Typography variant="caption">{t('viewProposal.label')}</Typography>
              </Box>
            )}
            {cloneClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <CloneIcon
                  onClick={() => cloneClicked(item.id)}
                  disabled={!canClone(item)}
                  toolTip={t('cloneProposal.toolTip')}
                />
                <Typography variant="caption">{t('cloneProposal.label')}</Typography>
              </Box>
            )}
            {deleteClicked && (
              <Box display="flex" flexDirection="column" alignItems="center">
                <TrashIcon
                  onClick={() => deleteClicked(item.id)}
                  disabled={!canDelete(item)}
                  toolTip={t(
                    canDelete(item) ? 'deleteProposal.toolTip' : 'deleteProposal.disabled'
                  )}
                />
                <Typography variant="caption">{t('delete.label')}</Typography>
              </Box>
            )}
          </Box>
        </TableCell>

        <TableCell role="gridcell" sx={{ maxWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            {item.id}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ maxWidth: 200, whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.cycle}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {item.title}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ width: 200, whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {cycleInfo?.type ?? NOT_SPECIFIED}
          </Typography>
        </TableCell>

        <TableCell
          role="gridcell"
          sx={{
            width: 200,
            whiteSpace: 'nowrap',
            backgroundColor: getStatusColor(item.status).bg[0]
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {item.status}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ width: 200, whiteSpace: 'nowrap' }}>
          <Typography variant="body2" color="text.secondary">
            {presentDateTime(item.lastUpdated)}
          </Typography>
        </TableCell>

        <TableCell role="gridcell" sx={{ width: 200, whiteSpace: 'nowrap' }}>
          <>{presentDate(cycleInfo?.cycleInformation?.proposalClose || NOT_SPECIFIED)}</>
        </TableCell>
      </TableRow>
    </>
  );
}
