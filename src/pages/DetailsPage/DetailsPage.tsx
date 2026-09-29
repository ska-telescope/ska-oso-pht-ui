import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import {
  DETAILS,
  ERROR_SECS,
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
import ObservationTypeField from '../../components/fields/observationType/ObservationType';
import { useObservationTypeOptions } from '../../components/fields/observationType/useObservationTypeOptions';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import useAxiosAuthClient from '@/services/axios/axiosAuthClient/axiosAuthClient';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';
import { subarrayConfigurationLow, subarrayConfigurationMid } from '@/utils/types/observatoryData';

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
  const [validateToggle, setValidateToggle] = React.useState(false);
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);
  const [scienceCategoryId, setScienceCategoryId] = React.useState(
    getProposal().scienceCategory ?? ''
  );
  const [abstract, setAbstract] = React.useState(getProposal().abstract ?? '');
  const [initial, setInitial] = React.useState(true);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = () => {
    const status = validateDetailsPage(getProposal());
    const temp = getProposalState().map((v, i) => (i === PAGE ? status : v));
    updateAppContent1(temp);
  };

  const saveAbstract = () => {
    const p = { ...getProposal(), abstract };
    setProposal(p);
    const status = validateDetailsPage(p);
    const temp = getProposalState().map((v, i) => (i === PAGE ? status : v));
    updateAppContent1(temp);
  };

  // Avoid a stale copy of the abstract being stored on the debounce by explicitly keeping a ref to it.
  const saveAbstractRef = React.useRef(saveAbstract);
  saveAbstractRef.current = saveAbstract;

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

  React.useEffect(() => {
    if (!initial) {
      handleChanges();
    }
    setInitial(false);
  }, [scienceCategoryId]);

  // Abstract changes (save without triggering autogeneration)
  React.useEffect(() => {
    if (!initial) {
      // Debounce to avoid saving on every keystroke; breadcrumb validation is also
      // updated here (rather than relying on the [getProposal()] chain) to ensure
      // it reflects the saved abstract without requiring a full re-render cycle.
      const timer = setTimeout(() => saveAbstractRef.current(), ERROR_SECS);
      return () => clearTimeout(timer);
    }
  }, [abstract]);

  const handleChanges = () => {
    setProposal({
      ...getProposal(),
      scienceCategory: scienceCategoryId,
      scienceSubCategory: [1],
      abstract: abstract
    });
  };

  const abstractField = () => {
    const MAX_CHAR = Number(t('abstract.maxChar'));
    const MAX_WORD = Number(t('abstract.maxWord'));
    const numRows = Number(t('abstract.minDisplayRows'));

    const setValue = (e: string) => {
      setAbstract(e.substring(0, MAX_CHAR));
    };

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

    function validateWordCount(title: string) {
      if (countWords(title) > MAX_WORD) {
        return `${t('specialCharacters.numWord')} ${countWords(title)} / ${MAX_WORD}`;
      }
    }

    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <TextEntry
          label={t('abstract.label')}
          testId="abstractId"
          rows={numRows}
          required
          value={abstract}
          setValue={(e: string) => setValue(e)}
          onFocus={() => setHelp('abstract.help')}
          onBlur={saveAbstract}
          helperText={helperFunction(abstract)}
          errorText={validateWordCount(abstract)}
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

  // SV proposals have a single observation whose type is the observing mode. The subarray is
  // AA2 until others are supported for SV.
  const observation = getProposal().observations?.[0];
  const isLow = observation ? observation.telescope === TELESCOPE_LOW_NUM : !!osdLOW;
  const observingModeOptions = useObservationTypeOptions(SA_AA2, isLow);

  const changeObservingMode = async (mode: string) => {
    if (mode === observation?.type) return;
    const hasTarget = (getProposal().targets?.length ?? 0) > 0;
    const record = isLow ? osdLOW : osdMID;
    const sArray = (
      record?.subArrays as (subarrayConfigurationLow | subarrayConfigurationMid)[] | undefined
    )?.find((sub) => sub.subArray === SA_AA2);
    const result = await setObservingMode(
      mode,
      getProposal,
      setProposal,
      authAxiosClient,
      sArray?.numberZoomChannels
    );
    if (!result.success) {
      notifyError(t(result.error ?? 'autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
    } else if (hasTarget) {
      notifySuccess(t('autoLink.success'), NOTIFICATION_DELAY_IN_SECONDS);
    }
  };

  const observingModeField = () => (
    <Box pt={0} sx={{ maxWidth: 500 }}>
      <ObservationTypeField
        options={observingModeOptions}
        required
        value={observation?.type ?? TYPE_CONTINUUM}
        setValue={changeObservingMode}
      />
    </Box>
  );

  const categoryField = () => (
    <Box pt={0} sx={{ maxWidth: 500 }}>
      {' '}
      <DropDown
        options={DETAILS.ScienceCategory}
        errorText={
          typeof getProposal().scienceCategory === 'number' ? '' : t('scienceCategory.error')
        }
        required
        testId="categoryId"
        value={scienceCategoryId}
        setValue={setScienceCategoryId}
        label={t('scienceCategory.label')}
        onFocus={() => setHelp('scienceCategory.help')}
      />
    </Box>
  );

  const row2 = (component: React.ReactNode) => (
    <Grid container alignItems="center" justifyContent="center" spacing={GAP}>
      <Grid size={{ xs: 7 }} style={{ textAlign: 'left' }}>
        {component}
      </Grid>
    </Grid>
  );

  // SV proposals have no science category; observing mode is chosen here instead
  return (
    <Shell page={PAGE}>
      <Stack pt={GAP} spacing={GAP}>
        <Grid mt={4}>
          {row2(
            getProposal().proposalType === PROPOSAL_TYPE.SCIENCE_VERIFICATION
              ? observingModeField()
              : categoryField()
          )}
        </Grid>
        <Grid mt={7}>{row2(abstractField())}</Grid>
      </Stack>
    </Shell>
  );
}
