import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  useTheme,
  Grid2
} from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';
import ViewIcon from '@/components/icon/viewIcon/viewIcon';
import GetProposal from '@/services/axios/getProposal/getProposal';
import { validateProposal } from '@/utils/proposalValidation';
import { PMT } from '@/utils/constants';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { useNotify } from '@/utils/notify/useNotify';

const STATUS_SIZE = 20;

interface TableScienceReviewsProps {
  data: any;
  excludeFunction: (detail: any) => void;
}

export default function TableScienceReviews({ data, excludeFunction }: TableScienceReviewsProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();
  const navigate = useNavigate();
  const { notifyError } = useNotify();

  const { clearApp, updateAppContent1, updateAppContent2 } = storageObject.useStore();

  const authClient = useAxiosAuthClient();

  const getTheProposal = async (id: string) => {
    clearApp();

    const response = await GetProposal(authClient, id);
    if (typeof response === 'string') {
      notifyError(t('proposal.error'));
      return false;
    } else {
      updateAppContent1(validateProposal(response));
      updateAppContent2(response);
      validateProposal(response);
      return true;
    }
  };

  const handleViewAction = async (item: any, detail: any) => {
    const output = item;
    output.reviews = [detail];
    getTheProposal(item.id).then(success => {
      if (success === true) {
        navigate(PMT[5], { replace: true, state: output });
      }
    });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <TableContainer
        component={Paper}
        elevation={1}
        role="region"
        aria-label="Employee data table with expandable details"
        data-testid="employee-table"
      >
        <Table aria-label={`Review comments and ranks for ${data.title}`}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>{t('status.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('generalComments.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('srcNetComments.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>{t('rank.label')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '60px' }}>
                {t('tableReviewDecision.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.reviews?.map(
              (
                detail: {
                  status:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | null
                    | undefined;
                  comments:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | null
                    | undefined;
                  srcNet:
                    | string
                    | number
                    | boolean
                    | ReactElement<any, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | null
                    | undefined;
                  reviewType: {
                    rank:
                      | string
                      | number
                      | boolean
                      | ReactElement<any, string | JSXElementConstructor<any>>
                      | Iterable<ReactNode>
                      | ReactPortal
                      | null
                      | undefined;
                    excludedFromDecision: any;
                  };
                },
                detailIndex: Key | null | undefined
              ) => (
                <TableRow key={detailIndex}>
                  <TableCell
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail?.status}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail.comments}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail.srcNet}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                      {detail.reviewType.rank}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 1.5,
                      px: 2
                    }}
                  >
                    <Grid2 container direction="row" alignItems="center" gap={1} wrap="nowrap">
                      <Grid2>
                        <IconButton
                          onClick={() =>
                            detail.status === 'To Do' ? null : excludeFunction(detail)
                          }
                          style={{ cursor: 'hand' }}
                          // CODE BELOW WILL BE IMPLEMENTED AT A LATER DATE
                          // disabled={
                          //   !detail.reviewType.excludedFromDecision &&
                          //   item.reviews.filter(
                          //     el => el.reviewType.excludedFromDecision === false
                          //   ).length < 2
                          // }
                        >
                          <StatusIcon
                            testId={`includeIcon-${data.id}-${detailIndex}`}
                            icon
                            level={
                              detail.status === 'To Do' || detail.reviewType.excludedFromDecision
                                ? 1
                                : 0
                            }
                            size={STATUS_SIZE}
                          />
                        </IconButton>
                      </Grid2>
                      <Grid2>
                        <ViewIcon
                          onClick={() => handleViewAction(data, detail)}
                          aria-label={`View detail ${
                            typeof detailIndex === 'number' ? detailIndex + 1 : 1
                          } for ${data.title}`}
                          testId={`view-detail-button-${data.id}-${detailIndex}`}
                          toolTip="View detail"
                        />
                      </Grid2>
                    </Grid2>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
