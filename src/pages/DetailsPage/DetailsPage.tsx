import React from 'react';
import { ProposalType } from '@/models/proposals/proposal';
import { useFormContext } from 'react-hook-form';
import { Box, Grid, Stack } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import {
  ControlledSelect,
  ControlledTextField
} from '@ska-telescope/ska-gui-components/controlled';
import { DETAILS, PAGE_DETAILS, PROPOSAL_TYPE, SA_AA2 } from '@utils/constants.ts';
import { countWords } from '@utils/helpers.ts';
import { validateDetailsPage } from '@utils/validation/validation.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useObservationTypeOptions } from '../../components/fields/observationType/useObservationTypeOptions';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';
import { ObservingMode, OBSERVING_MODE, TELESCOPE } from '@/models/proposals/observations';
import { OBSERVING_MODE_BY_LEGACY_TYPE } from '@/models/proposals/legacyObservations';
import { subarrayConfigurationLow, subarrayConfigurationMid } from '@/utils/types/observatoryData';
import { useWatch } from 'react-hook-form';
import { ProposalType as ProposalFormValues } from '@/models/proposals/proposal';

const PAGE = PAGE_DETAILS;
const LINE_OFFSET = 30;
const GAP = 0;

export default function DetailsPage() {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { osdLOW, osdMID } = useOSDAccessors();
  const { axiosClient: authAxiosClient } = useAxiosAuthClient();

  const { application, updateAppContent1 } = storageObject.useStore();
  const { setHelp } = useHelp();
  const form = useFormContext<ProposalType>();

  const abstract = useWatch<ProposalFormValues, 'abstract'>({
    control: form.control,
    name: 'abstract'
  });
  const scienceCategory = useWatch<ProposalFormValues, 'scienceCategory'>({
    control: form.control,
    name: 'scienceCategory'
  });
  // An SV proposal's observing mode, chosen here, is its observation's
  const [proposalType, observations] = useWatch({
    control: form.control,
    name: ['proposalType', 'observations']
  });
  const status = validateDetailsPage({ abstract, scienceCategory, proposalType, observations });
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
  const observation = useWatch({ control: form.control, name: 'observations.0' });
  const isLow = observation ? observation.telescope === TELESCOPE.LOW : !!osdLOW;
  // The options still use the legacy observation types
  const observingModeOptions = useObservationTypeOptions(SA_AA2, isLow).map((option) => ({
    ...option,
    value: OBSERVING_MODE_BY_LEGACY_TYPE[option.value]
  }));

  const changeObservingMode = async (mode: ObservingMode) => {
    if (mode === observation?.observingMode) return;
    const record = isLow ? osdLOW : osdMID;
    const sArray = (
      record?.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined
    )?.find((sub) => sub.subArray === SA_AA2);
    await setObservingMode(
      mode,
      form,
      authAxiosClient,
      osdLOW?.basicCapabilities?.minElevationDeg ?? null,
      sArray?.numberZoomChannels
    );
  };

  const observingModeField = () => (
    <Box
      sx={{
        pt: 0,
        maxWidth: 500
      }}
    >
      <ControlledSelect
        name="observations.0.observingMode"
        label={t('observationType.label')}
        options={observingModeOptions}
        disabled={observingModeOptions.length < 2}
        required
        value={observation?.observingMode ?? OBSERVING_MODE.CONTINUUM}
        // onChange completely resets the observation so leave form update to be done there
        withFormUpdate={false}
        onChange={(evt) => void changeObservingMode(evt.target.value as ObservingMode)}
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
      <ControlledSelect
        name="scienceCategory"
        options={DETAILS.ScienceCategory}
        helperText={scienceCategory == null ? t('scienceCategory.error') : undefined}
        required
        data-testid="categoryId"
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
            proposalType.type === PROPOSAL_TYPE.SCIENCE_VERIFICATION
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
