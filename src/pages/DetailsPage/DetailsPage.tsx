import React from 'react';
import { ProposalType } from '@/models/proposals/proposal';
import { useFormContext } from 'react-hook-form';
import { Box, Grid, Stack } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { ControlledTextField } from '@ska-telescope/ska-gui-components/controlled';
import {
  DETAILS,
  NOTIFICATION_DELAY_IN_SECONDS,
  PAGE_DETAILS,
  PROPOSAL_TYPE,
  SA_AA2,
  TELESCOPE_LOW_NUM,
  TYPE_CONTINUUM
} from '@utils/constants.ts';
import { countWords } from '@utils/helpers.ts';
import { Proposal } from '@utils/types/proposal.tsx';
import { validateDetailsPage } from '@utils/validation/validation.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useObservationTypeOptions } from '../../components/fields/observationType/useObservationTypeOptions';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';
import { subarrayConfigurationLow, subarrayConfigurationMid } from '@/utils/types/observatoryData';
import { useController } from 'react-hook-form';
import { ProposalType as ProposalFormValues } from '@/models/proposals/proposal';

const PAGE = PAGE_DETAILS;
const LINE_OFFSET = 30;
const GAP = 0;

export default function DetailsPage() {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { notifyError, notifySuccess } = useNotify();
  const { osdLOW, osdMID } = useOSDAccessors();
  const { axiosClient: authAxiosClient } = useAxiosAuthClient();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const {
    field: { value: abstract }
  } = useController<ProposalFormValues, 'abstract'>({ name: 'abstract' });
  const {
    field: { value: scienceCategory, onChange: setScienceCategory },
    fieldState: { error: categoryError }
  } = useController<ProposalFormValues, 'scienceCategory'>({ name: 'scienceCategory' });
  const status = validateDetailsPage({ ...getProposal(), abstract, scienceCategory });
  const proposalState = application.content1 as number[];
  React.useEffect(() => {
    if (proposalState[PAGE] === status) return;
    updateAppContent1(proposalState.map((value, index) => (index === PAGE ? status : value)));
  }, [status, proposalState, updateAppContent1]);

  const [openAbstractLatexModal, setOpenAbstractLatexModal] = React.useState(false);
  const handleOpenAbstractLatexModal = () => setOpenAbstractLatexModal(true);
  const handleCloseAbstractLatexModal = () => setOpenAbstractLatexModal(false);

  React.useEffect(() => {
    setHelp('page.' + PAGE + '.help');
  }, []);

  const abstractField = () => {
    const MAX_WORD = Number(t('abstract.maxWord'));
    const numRows = Number(t('abstract.minDisplayRows'));

    const helperFunction = (abstract: string) => {
      const color = theme.palette.error.dark;

      const baseHelperText = t('abstract.helper', {
        current: countWords(abstract),
        max: MAX_WORD
      });
      return countWords(abstract) > MAX_WORD ? (
        <>
          {baseHelperText} <span style={{ color: color }}>(WORD LIMIT EXCEEDED)</span>
        </>
      ) : (
        baseHelperText
      );
    };

    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <ControlledTextField
          name="abstract"
          label={t('abstract.label')}
          multiline
          rows={numRows}
          required
          slotProps={{
            htmlInput: { 'data-testid': 'abstractId' },
            input: {
              endAdornment: (
                <ViewIcon onClick={handleOpenAbstractLatexModal} toolTip="preview latex" />
              )
            }
          }}
          onFocus={() => setHelp('abstract.help')}
          helperText={helperFunction(abstract)}
        />
        <LatexPreviewModal
          value={abstract}
          open={openAbstractLatexModal}
          onClose={handleCloseAbstractLatexModal}
          title={t('abstract.latexPreviewTitle')}
        />
      </Box>
    );
  };

  // SV proposals have a single observation whose type is the observing mode. The subarray is
  // AA2 until others are supported for SV.
  const observation = getProposal().observations?.[0];
  const isLow = observation ? observation.telescope === TELESCOPE_LOW_NUM : !!osdLOW;
  const observingModeOptions = useObservationTypeOptions(SA_AA2, isLow);

  const form = useFormContext<ProposalType>();

  const changeObservingMode = async (mode: string) => {
    if (mode === observation?.type) return;
    const hasTarget = (form.getValues('targets')?.length ?? 0) > 0;
    const record = isLow ? osdLOW : osdMID;
    const sArray = (
      record?.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined
    )?.find((sub) => sub.subArray === SA_AA2);
    const result = await setObservingMode(
      mode,
      getProposal,
      setProposal,
      form,
      authAxiosClient,
      sArray?.numberZoomChannels
    );
    if (!result.success) {
      notifyError(t(result.error ?? 'autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
    } else {
      if (hasTarget) {
        notifySuccess(t('autoLink.success'), NOTIFICATION_DELAY_IN_SECONDS);
      }
    }
  };

  const observingModeField = () => (
    <Box
      sx={{
        pt: 0,
        maxWidth: 500
      }}
    >
      <DropDown
        label={t('observationType.label')}
        options={observingModeOptions}
        disabled={observingModeOptions.length < 2}
        required
        testId="observationType"
        value={observation?.type ?? TYPE_CONTINUUM}
        setValue={(mode: string) => {
          void changeObservingMode(mode);
        }}
        onFocus={() => setHelp('observationType.help')}
      />
    </Box>
  );

  const categoryField = () => (
    <Box
      sx={{
        pt: 0,
        maxWidth: 500
      }}
    >
      {' '}
      <DropDown
        options={DETAILS.ScienceCategory}
        errorText={
          categoryError
            ? t('scienceCategory.error')
            : scienceCategory == null
              ? t('scienceCategory.error')
              : ''
        }
        required
        testId="categoryId"
        value={scienceCategory ?? ''}
        setValue={setScienceCategory}
        label={t('scienceCategory.label')}
        onFocus={() => setHelp('scienceCategory.help')}
      />
    </Box>
  );

  const row2 = (component: React.ReactNode) => (
    <Grid
      container
      spacing={GAP}
      sx={{
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Grid size={{ xs: 7 }} style={{ textAlign: 'left' }}>
        {component}
      </Grid>
    </Grid>
  );

  // SV proposals have no science category; observing mode is chosen here instead
  return (
    <Shell page={PAGE}>
      <Stack
        spacing={GAP}
        sx={{
          pt: GAP
        }}
      >
        <Grid
          sx={{
            mt: 4
          }}
        >
          {row2(
            getProposal().proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION
              ? observingModeField()
              : categoryField()
          )}
        </Grid>
        <Grid
          sx={{
            mt: 7
          }}
        >
          {row2(abstractField())}
        </Grid>
      </Stack>
    </Shell>
  );
}
