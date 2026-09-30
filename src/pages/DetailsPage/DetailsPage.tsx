import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import useAxiosAuthClient from '@services/axios/axiosAuthClient/axiosAuthClient.ts';
import {
  SA_AA2,
  DETAILS,
  ERROR_SECS,
  PAGE_DETAILS,
  STATUS_ERROR,
  STATUS_OK,
  NOTIFICATION_DELAY_IN_SECONDS
} from '@utils/constants.ts';
import { countWords, obTypeTransform } from '@utils/helpers.ts';
import { Proposal } from '@utils/types/proposal.tsx';
import { useTheme } from '@mui/material/styles';
import Shell from '../../components/layout/Shell/Shell';
import LatexPreviewModal from '../../components/info/latexPreviewModal/latexPreviewModal';
import ViewIcon from '../../components/icon/viewIcon/viewIcon';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useHelp } from '@/utils/help/useHelp';
import { useNotify } from '@/utils/notify/useNotify';
import autoLinking from '@/utils/autoLinking/AutoLinking';
import Target from '@/utils/types/target';
import { ControlledTextField } from '@components/controlled/controlledTextField.tsx';
import { ControlledSelect } from '@components/controlled/controlledSelect.tsx';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { ProposalType } from '@/models/proposal/proposal.ts';

const PAGE = PAGE_DETAILS;
const LINE_OFFSET = 30;
const GAP = 0;

export const checkAutoLink = (autolink: boolean, targets: Target[], scienceCat: string) => {
  if (!autolink || (targets?.length ?? 0) <= 0 || scienceCat === '') {
    return false;
  } else {
    return true;
  }
};

export default function DetailsPage() {
  const ctrlName = `details` as const;
  const { getValues } = useFormContext<ProposalType>();
  const { errors } = useFormState();

  const formValues = useWatch<ProposalType>({
    name: ctrlName
  });

  React.useEffect(() => {
    // Updates the old store with the form values, so we can do the migration piecewise
    // We should be able to delete this once the full object is got from the form.
    // TODO I think this should be done in one place in the PHT component, and we can use mappers
    // (which are graudally built up during the refactoring) on the whole form object
    setProposal({
      ...getProposal(),
      scienceCategory: getValues(`${ctrlName}.mode`),
      scienceSubCategory: [1],
      abstract: getValues(`${ctrlName}.summary`)
    });
  }, [formValues]);

  const modeValue = useWatch<ProposalType>({
    name: ctrlName
  });

  React.useEffect(() => {
    // This replaces the second half of the old handleChanges
    // It triggers autolinking if the mode changes. Really when the full form is in place,
    // some parent component should watch for everything that autolinking should be triggered from
    // in one place
    generateAutoLinkData();
  }, [modeValue]);

  const { t } = useScopedTranslation();
  const { notifyError, notifySuccess } = useNotify();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();
  const { osdCyclePolicy, osdLOW, osdMID } = useOSDAccessors();

  // Should eventually be able to remove these
  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const { isSV } = useOSDAccessors();
  const { axiosClient: authAxiosClient } = useAxiosAuthClient();

  const getProposalState = () => application.content1 as number[];

  // This replaces the validation toggle and setTheProposalState, and sets the
  // content1 with the state (should get rid of this altogether?)
  React.useEffect(() => {
    const status = errors.details ? STATUS_ERROR : STATUS_OK; // do a better is empty check on the error
    const temp = getProposalState().map((v, i) => (i === PAGE ? status : v));
    updateAppContent1(temp);
  }, [errors]);

  const [openAbstractLatexModal, setOpenAbstractLatexModal] = React.useState(false);
  const handleOpenAbstractLatexModal = () => setOpenAbstractLatexModal(true);
  const handleCloseAbstractLatexModal = () => setOpenAbstractLatexModal(false);

  React.useEffect(() => {
    setHelp('scienceCategory.help');
  }, []);

  const generateAutoLinkData = async () => {
    const target = getProposal().targets![0]; // there should be only 1 target for auto-generation
    // The default zoom observation's zoomChannels is a static placeholder with no knowledge of
    // the actual subarray's channel cap - pass the real cap through so it isn't baked in.
    const record = osdLOW ? osdLOW : osdMID;
    const sArray = record?.subArrays.find((sub: any) => sub.subArray === SA_AA2);
    const defaults = await autoLinking(
      target,
      getProposal,
      setProposal,
      authAxiosClient,
      modeValue,
       `${ctrlName}.summary`,
      sArray?.numberZoomChannels
    );
    if (defaults && defaults.success) {
      notifySuccess(t('autoLink.success'), NOTIFICATION_DELAY_IN_SECONDS);
    } else {
      notifyError(t(defaults?.error ?? 'autoLink.error'), NOTIFICATION_DELAY_IN_SECONDS);
    }
  };

  const abstractField = () => {
    const numRows = Number(t('abstract.minDisplayRows'));
    const summaryFieldName = `${ctrlName}.summary`;
    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <ControlledTextField
          name={summaryFieldName}
          label={t('abstract.label')}
          multiline
          minRows={numRows}
        />
        <ViewIcon onClick={handleOpenAbstractLatexModal} toolTip="preview latex" />
        <LatexPreviewModal
          value={getValues(summaryFieldName)}
          open={openAbstractLatexModal}
          onClose={handleCloseAbstractLatexModal}
          title={t('abstract.latexPreviewTitle')}
        />
      </Box>
    );
  };

  const getObservingModeOptions = () => {
    // For now, we assume that there is a single target and observation in SV proposals and the subArray is AA2
    const record = osdLOW ? osdLOW : osdMID;
    const sArray = record?.subArrays.find((sub: any) => sub.subArray === SA_AA2);
    const inData = obTypeTransform(sArray?.cbfModes ?? []);
    return inData.map((type) => {
      const label = t('scienceCategory.' + type);
      return {
        label,
        subCategory: [{ label: 'Not specified', value: 1 }],
        value: type,
        observationType: type
      };
    });
  };
  const svObservingModes = React.useMemo(
    () => getObservingModeOptions(),
    [osdCyclePolicy, osdLOW, osdMID]
  );

  const getCategoryOptions = () => {
    return isSV ? svObservingModes : DETAILS.ScienceCategory;
  };

  const categoryField = () => (
    <Box pt={0} sx={{ maxWidth: 500 }}>
      <ControlledSelect
        name={`${ctrlName}.mode`}
        options={getCategoryOptions()}
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

  return (
    <Shell page={PAGE}>
      <Stack pt={GAP} spacing={GAP}>
        <Grid mt={4}>{row2(categoryField())}</Grid>
        <Grid mt={7}>{row2(abstractField())}</Grid>
      </Stack>
    </Shell>
  );
}
