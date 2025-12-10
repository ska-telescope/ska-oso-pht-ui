import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import {
  GENERAL,
  LAB_POSITION,
  OBSERVATION_TYPE_SHORT_BACKEND,
  PAGE_GENERAL
} from '@utils/constants.ts';
import { countWords } from '@utils/helpers.ts';
import { Proposal } from '@utils/types/proposal.tsx';
import { validateProposal } from '@utils/validation/validation.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import autoLinking from '@/utils/autoLinking/AutoLinking';

const PAGE = PAGE_GENERAL;
const LINE_OFFSET = 30;
const LABEL_WIDTH = 3;
const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function GeneralPage() {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();
  const theme = useTheme();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const { setHelp } = useHelp();
  const { osdCyclePolicy } = useOSDAccessors();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const { osdCloses, osdOpens } = useOSDAccessors();

  const [isObsModeChanged, setIsObsModeChanged] = React.useState(false); // For auto-link

  // only generate observation, dataprodutsdp, senscalc, calibration when autoLink is true & obs mode is selected & target exists
  // (science category used for obs mode in SV)
  const autoLink = osdCyclePolicy.linkObservationToObservingMode;

  const setTheProposalState = () => {
    updateAppContent1(validateProposal(getProposal()));
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
    if (isSV() && id !== getProposal().scienceCategory) {
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

  const cycleIdField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycle.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
      testId="cycleId"
      value={getProposal().cycle}
      onFocus={() => setHelp('abstract.help')}
      disabled
    />
  );

  const cycleClosesField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycleCloses.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
      testId="cycleCloses"
      value={osdCloses(true)}
      onFocus={() => setHelp('abstract.help')}
      disabled
    />
  );

  const cycleOpensField = () => (
    <TextEntry
      disabledUnderline
      label={t('cycleOpens.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH}
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
          label={t('abstract.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
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

  // Separate function for ScienceCategory (optional, for symmetry)
  const getScienceCategoryOptions = () => {
    return GENERAL.ScienceCategory;
  };

  // Main function using the helpers
  const getCategoryOptions = () => {
    return isSV() ? getObservingModeOptions() : getScienceCategoryOptions();
  };

  const categoryField = () => (
    <DropDown
      options={getCategoryOptions()}
      errorText={
        typeof getProposal().scienceCategory === 'number' ? '' : t('scienceCategory.error')
      }
      required
      testId="categoryId"
      value={getProposal().scienceCategory ?? ''}
      setValue={checkCategory}
      label={t('scienceCategory.label')}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={LABEL_WIDTH * 2}
      onFocus={() => setHelp('scienceCategory.help')}
    />
  );

  return (
    <Shell page={PAGE}>
      <Grid container direction="row" p={5} spacing={2} alignItems="left">
        <Grid pb={3} size={{ md: 12, lg: 8 }}>
          <Grid container direction="row">
            <Grid pr={4} size={{ md: 12 }}>
              {cycleIdField()}
            </Grid>
            <Grid pr={4} size={{ md: 12 }}>
              {cycleOpensField()}
            </Grid>
            <Grid pr={4} size={{ md: 12 }}>
              {cycleClosesField()}
            </Grid>
            <Grid pt={2} pb={2} size={{ md: 12 }}>
              <Grid size={{ md: 12, lg: 6 }}>{categoryField()}</Grid>
            </Grid>
            <Grid size={{ md: 12 }}>{abstractField()}</Grid>
          </Grid>
          <Grid size={{ md: 6 }}></Grid>
        </Grid>
      </Grid>
    </Shell>
  );
}
