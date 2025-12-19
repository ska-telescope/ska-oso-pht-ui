import React from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { DETAILS, OBSERVATION_TYPE_SHORT_BACKEND, PAGE_DETAILS } from '@utils/constants.ts';
import { countWords } from '@utils/helpers.ts';
import { Proposal } from '@utils/types/proposal.tsx';
import { validateProposal } from '@utils/validation/validation.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import autoLinking from '@/utils/autoLinking/AutoLinking';

const PAGE = PAGE_DETAILS;
const LINE_OFFSET = 30;
const GAP = 4;
const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function DetailsPage() {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const { setHelp } = useHelp();
  const { autoLink, osdCyclePolicy } = useOSDAccessors();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { isSV, osdCloses, osdOpens } = useOSDAccessors();

  //TODO: @Sarah
  // Currently setProposal is happening twice for science category & autoLinking, the setProposal should happen once and account for all changes

  const [isObsModeChanged, setIsObsModeChanged] = React.useState(false); // For auto-link

  const setTheProposalState = () => {
    // only generate observation, data products, senscalc, calibration when autoLink is true & obs mode is selected & target exists
    // (science category used for obs mode in SV)
    updateAppContent1(validateProposal(getProposal(), autoLink));
  };

  const [openAbstractLatexModal, setOpenAbstractLatexModal] = React.useState(false);
  const handleOpenAbstractLatexModal = () => setOpenAbstractLatexModal(true);
  const handleCloseAbstractLatexModal = () => setOpenAbstractLatexModal(false);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setHelp('scienceCategory.help');
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState();
  }, [validateToggle]);

  const checkCategory = (id: number) => {
    if (isSV && id !== getProposal().scienceCategory) {
      setIsObsModeChanged(true);
    }
    setProposal({ ...getProposal(), scienceCategory: id, scienceSubCategory: [1] });
  };

  React.useEffect(() => {
    checkTargetObservation();
  }, [isObsModeChanged]);

  const checkTargetObservation = () => {
    if (!autoLink || typeof getProposal().scienceCategory !== 'number') return;

    // ********************************************************** //
    // check if obs mode is defined
    // check if there is a target
    // check if there is an observation
    // if not, create a default observation based on the observation mode
    // if yes, check observation type matches observation mode
    // regenerate observation if type doesn't match / has changed
    // ********************************************************** //

    // check if there is a target
    if ((getProposal().targets?.length ?? 0) > 0) {
      // check if there is an observation defined
      if ((getProposal().observations?.length ?? 0) > 0) {
        if (
          // observation type doesn't match observation mode
          getProposal().observations![0].type !== getProposal().scienceCategory ||
          isObsModeChanged
        ) {
          generateAutoLinkData();
        }
      } else {
        // no observation, generate one
        generateAutoLinkData();
      }
    }
    setIsObsModeChanged(false);
  };

  const generateAutoLinkData = async () => {
    // TODO rename function
    const target = getProposal().targets![0]; // there should be only 1 target for auto-generation
    const defaults = await autoLinking(target, getProposal, setProposal, false);
    if (defaults && defaults.success) {
      notifySuccess(t('autoLink.success'), NOTIFICATION_DELAY_IN_SECONDS);
    } else {
      notifyError(defaults?.error ?? t('autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
    }
  };

  const displayLabel = (inValue: string, isBold: boolean = false) => (
    <Typography variant="subtitle1" style={{ fontWeight: isBold ? 600 : 300 }}>
      {inValue}
      {isBold ? ' *' : ''}
    </Typography>
  );

  const cycleIdField = () => (
    <TextEntry
      disabledUnderline
      label=""
      testId="cycleId"
      value={getProposal().cycle}
      onFocus={() => setHelp('abstract.help')}
      disabled
    />
  );

  const cycleClosesField = () => (
    <TextEntry
      disabledUnderline
      label=""
      testId="cycleCloses"
      value={osdCloses(true)}
      onFocus={() => setHelp('abstract.help')}
      disabled
    />
  );

  const cycleOpensField = () => (
    <TextEntry
      disabledUnderline
      label=""
      testId="cycleOpens"
      value={osdOpens(true)}
      onFocus={() => setHelp('abstract.help')}
      disabled
    />
  );

  const abstractField = () => {
    const MAX_CHAR = Number(t('abstract.maxChar'));
    const MAX_WORD = Number(t('abstract.maxWord'));
    const numRows = Number(t('abstract.minDisplayRows'));

    const setValue = (e: string) => {
      if (countWords(e) < MAX_WORD || (countWords(e) === MAX_WORD && !/\s$/.test(e))) {
        setProposal({ ...getProposal(), abstract: e.substring(0, MAX_CHAR) });
      }
    };

    const helperFunction = (abstract: string) => {
      const color = theme.palette.error.dark;

      const baseHelperText = t('abstract.helper', {
        current: countWords(abstract),
        max: MAX_WORD
      });
      return countWords(abstract) === MAX_WORD ? (
        <>
          {baseHelperText} <span style={{ color: color }}>(MAX WORD COUNT REACHED)</span>
        </>
      ) : (
        baseHelperText
      );
    };

    function validateWordCount(title: string) {
      if (countWords(title) > MAX_WORD) {
        return `${t('specialCharacters.numWord')} ${countWords(title)} / ${MAX_WORD}`;
      }
    }

    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <TextEntry
          label=""
          testId="abstractId"
          rows={numRows}
          required
          value={getProposal().abstract}
          setValue={(e: string) => setValue(e)}
          onFocus={() => setHelp('abstract.help')}
          helperText={helperFunction(getProposal().abstract as string)}
          errorText={validateWordCount(getProposal().abstract as string)}
          suffix={<ViewIcon onClick={handleOpenAbstractLatexModal} toolTip="preview latex" />}
        />
        <LatexPreviewModal
          value={getProposal().abstract as string}
          open={openAbstractLatexModal}
          onClose={handleCloseAbstractLatexModal}
          title={t('abstract.latexPreviewTitle')}
        />
      </Box>
    );
  };

  const getObservingModeOptions = () => {
    const inData = osdCyclePolicy?.observationType ?? [];
    return inData.map(type => {
      const index = OBSERVATION_TYPE_SHORT_BACKEND.findIndex(obsType => obsType === type);
      const label = t('scienceCategory.' + index);
      return {
        label,
        subCategory: [{ label: 'Not specified', value: 1 }],
        value: index,
        observationType: index
      };
    });
  };

  const getCategoryOptions = () => {
    return isSV ? getObservingModeOptions() : DETAILS.ScienceCategory;
  };

  const categoryField = () => (
    <Box pt={0} sx={{ maxWidth: 500 }}>
      {' '}
      <DropDown
        options={getCategoryOptions()}
        errorText={
          typeof getProposal().scienceCategory === 'number' ? '' : t('scienceCategory.error')
        }
        required
        testId="categoryId"
        value={getProposal().scienceCategory ?? ''}
        setValue={checkCategory}
        label=""
        onFocus={() => setHelp('scienceCategory.help')}
      />
    </Box>
  );

  const row = (label: string, component: React.ReactNode, isBold: boolean = false) => (
    <Grid container alignItems="center" justifyContent="center" spacing={GAP}>
      <Grid size={{ xs: 2 }} style={{ alignSelf: 'flex-start', textAlign: 'left' }}>
        {displayLabel(t(label), isBold)}
      </Grid>
      <Grid size={{ xs: 7 }} style={{ textAlign: 'left' }}>
        {component}
      </Grid>
    </Grid>
  );

  return (
    <Shell page={PAGE}>
      <Stack pt={GAP} spacing={GAP}>
        {row('cycle.label', cycleIdField())}
        {row('cycleOpens.label', cycleOpensField())}
        {row('cycleCloses.label', cycleClosesField())}
        {row('scienceCategory.label', categoryField(), true)}
        {row('abstract.label', abstractField(), true)}
      </Stack>
    </Shell>
  );
}
