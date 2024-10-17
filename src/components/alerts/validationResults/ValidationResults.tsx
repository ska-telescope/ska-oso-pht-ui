import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import { DialogContent, Grid, Stack, Typography } from '@mui/material';
import { AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';
import useTheme from '@mui/material/styles/useTheme';
import Proposal from '../../../utils/types/proposal';
import Alert from '../../alerts/standardAlert/StandardAlert';
import CancelButton from '../../button/Cancel/Cancel';

interface ValidationResultsProps {
  open: boolean;
  onClose: Function;
  proposal: Proposal;
  results: string[];
}

const MODAL_WIDTH = '40%';
const TITLE_STYLE = 'h5';
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;
const SIZE = 20;

export default function ValidationResults({
  open,
  onClose,
  proposal,
  results
}: ValidationResultsProps) {
  const { t } = useTranslation('pht');
  const theme = useTheme();

  const getFont = (bold: boolean) => (bold ? 600 : 300);

  const handleCancel = () => {
    onClose();
  };

  const sectionTitle = () => (
    <Grid item>
      <Grid
        container
        sx={{ minHeight: '0.5rem', backgroundColor: theme.palette.primary.main }}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="button"> </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const headerContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
            {t('validationResults.title')}
          </Typography>
        </Grid>
        <Grid item>{proposal.id}</Grid>
      </Grid>
    </Grid>
  );

  const resultsContent = (results: string[]) => (
    <Grid item>
      <Stack>
        {results?.map(el => (
          <Grid p={1} key={el} container direction="row" justifyContent="left" alignItems="left">
            <Grid item>
              <StatusIcon testId="statusId" icon level={1} size={SIZE} />
            </Grid>
            <Grid pl={1} item>
              <Typography
                id="title"
                variant={CONTENT_STYLE}
                style={{ fontWeight: getFont(BOLD_CONTENT) }}
              >
                {t(el)}
              </Typography>
            </Grid>
          </Grid>
        ))}
      </Stack>
    </Grid>
  );

  const footerContent = () => (
    <Grid item>
      <Grid container direction="row" justifyContent="right" alignItems="right">
        <Grid item pt={1}>
          <CancelButton action={handleCancel} title="button.close" testId="cancelButtonTestId" />
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
      PaperProps={{
        style: {
          minWidth: MODAL_WIDTH,
          maxWidth: MODAL_WIDTH
        }
      }}
    >
      {proposal === null && (
        <Alert
          color={AlertColorTypes.Warning}
          text={t('displayProposal.warning')}
          testId="helpPanelId"
        />
      )}
      {proposal !== null && (
        <>
          <DialogContent>
            <Grid
              p={2}
              container
              direction="column"
              alignItems="space-evenly"
              justifyContent="space-around"
            >
              {headerContent()}
              {sectionTitle()}
              {resultsContent(results)}
              {sectionTitle()}
              {footerContent()}
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
