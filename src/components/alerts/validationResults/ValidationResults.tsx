import Dialog from '@mui/material/Dialog';
import { DialogContent, Grid, Stack, Typography, Box } from '@mui/material';
import { AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';
import { useTheme } from '@mui/material/styles';
import Proposal from '../../../utils/types/proposal';
import Alert from '../../alerts/standardAlert/StandardAlert';
import CancelButton from '../../button/Cancel/Cancel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ValidationResultsProps {
  open: boolean;
  onClose: Function;
  proposal: Proposal | null;
  results: string[];
}

const MODAL_WIDTH = '600px';
const TITLE_STYLE = 'h5';
const CONTENT_STYLE = 'subtitle2';
const BOLD_LABEL = true;
const BOLD_CONTENT = false;
const SIZE = 30;

export default function ValidationResults({
  open,
  onClose,
  proposal,
  results
}: ValidationResultsProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();

  const getFont = (bold: boolean) => (bold ? 600 : 300);

  const handleCancel = () => {
    onClose();
  };

  const sectionTitle = () => (
    <Grid>
      <Grid
        container
        sx={{ minHeight: '0.5rem', backgroundColor: theme.palette.primary.main }}
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid>
          <Typography variant="button"> </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  const headerContent = () => (
    <Grid pb={2}>
      <Typography id="title" variant={TITLE_STYLE} style={{ fontWeight: getFont(BOLD_LABEL) }}>
        {t('validationResults.title')}
      </Typography>
    </Grid>
  );

  const resultsContent = (results: string[]) => (
    <Grid>
      <Stack spacing={1}>
        {results?.map(el => (
          <Box
            key={el}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              padding: 1,
              flexWrap: 'nowrap'
            }}
          >
            <StatusIcon
              ariaDescription=""
              ariaTitle=""
              text="!"
              level={1}
              size={SIZE}
              testId="statusId"
              toolTip=""
            />
            <Typography
              variant={CONTENT_STYLE}
              sx={{
                fontWeight: getFont(BOLD_CONTENT),
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                flex: 1
              }}
            >
              {el}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Grid>
  );

  const footerContent = () => (
    <Grid>
      <Grid container direction="row" justifyContent="right" alignItems="right">
        <Grid pt={1}>
          <CancelButton action={handleCancel} title="closeBtn.label" testId="cancelButtonTestId" />
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
          minWidth: MODAL_WIDTH
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
