import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { FormProvider, Resolver, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Grid, Paper } from '@mui/material';
import { Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import {
  BAND_LOW_STR,
  FOOTER_HEIGHT_PHT,
  FOOTER_SPACER,
  NAV,
  PAGE_OBSERVATION,
  PAGE_OBSERVATION_ADD,
  PAGE_OBSERVATION_UPDATE,
  SA_AA2
} from '@/utils/constants';
import { ProposalType } from '@/models/proposals/proposal';
import {
  getObservationsSchema,
  newObservation,
  ObservationInput,
  ObservationOsd,
  ObservingBand,
  OBSERVING_MODE
} from '@/models/proposals/observations';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useHelp } from '@/utils/help/useHelp';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import AddButton from '@/components/button/Add/Add';
import {
  calibratorInputsChanged,
  refreshCalibrators,
  replacePstDataProduct,
  resizeImageDataProducts,
  setSpectralChannelsOut
} from '@/models/proposals/observationUpdates';
import ObservationView, { ObservationsForm } from '@/pages/ObservationPage/ObservationView';

const BACK_PAGE = PAGE_OBSERVATION;

const getEntrySchema = (osd: ObservationOsd) =>
  z.object({ observations: getObservationsSchema(osd).length(1) });

/**
 * The page to add an observation, or to update the one passed in the route state, for a proposal
 * with several observations. It is edited in an entry form of its own, and written to the proposal
 * form only when it is valid and the user adds or updates it. An SV proposal's observation is
 * edited in place on the observations page instead (ObservationInPlace).
 */
export default function ObservationEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setHelp } = useHelp();
  const { osdLOW, osdMID, selectedPolicy } = useOSDAccessors();
  const proposalForm = useFormContext<ProposalType>();

  // Rebuilt when the OSD changes, as the proposal form's is
  const resolver = React.useMemo(
    () => zodResolver(getEntrySchema({ low: osdLOW, mid: osdMID })) as Resolver<ObservationsForm>,
    [osdLOW, osdMID]
  );

  const editId = (location.state as { id?: string } | null)?.id;
  const observations = proposalForm.getValues('observations');
  const existing = editId ? observations.find((obs) => obs.id === editId) : undefined;
  const firstBand = (selectedPolicy?.cyclePolicies?.bands?.[0] ?? BAND_LOW_STR) as ObservingBand;

  const entryForm = useForm<ObservationsForm>({
    mode: 'all',
    resolver,
    defaultValues: {
      observations: [
        existing ??
          newObservation(firstBand, SA_AA2, OBSERVING_MODE.CONTINUUM, {
            low: osdLOW,
            mid: osdMID
          })
      ]
    }
  });

  React.useEffect(() => {
    setHelp('observationId');
  }, []);

  const groupIds = [
    ...new Set(
      observations
        .filter((obs) => obs.id !== editId)
        .flatMap((obs) => (obs.groupId ? [obs.groupId] : []))
    )
  ];

  const addObservation = () => {
    const newObservation = entryForm.getValues('observations.0');
    const existingObservations = proposalForm.getValues('observations');
    proposalForm.setValue(
      'observations',
      existingObservations.some((obs) => obs.id === newObservation.id)
        ? existingObservations.map((obs) => (obs.id === newObservation.id ? newObservation : obs))
        : [...existingObservations, newObservation]
    );

    // The proposal's data products and calibration follow what the update changed. A new
    // observation has no data products or link yet.
    const changed = (field: (obs: ObservationInput) => unknown) =>
      existing !== undefined &&
      JSON.stringify(field(existing)) !== JSON.stringify(field(newObservation));
    if (changed((obs) => obs.centralFrequency)) {
      resizeImageDataProducts(proposalForm, newObservation);
    }
    if (
      changed((obs) => (obs.observingMode === OBSERVING_MODE.SPECTRAL ? obs.zoomChannels : null))
    ) {
      setSpectralChannelsOut(proposalForm, newObservation);
    }
    if (changed((obs) => (obs.observingMode === OBSERVING_MODE.PST ? obs.pstMode : null))) {
      replacePstDataProduct(proposalForm, newObservation);
    }
    if (calibratorInputsChanged(existing, newObservation)) {
      void refreshCalibrators(proposalForm, newObservation.id);
    }
    navigate(NAV[BACK_PAGE]);
  };

  const footer = (
    <Paper
      sx={{
        bgcolor: 'transparent',
        position: 'fixed',
        bottom: FOOTER_HEIGHT_PHT,
        left: 0,
        right: 0
      }}
      elevation={0}
    >
      <Grid
        container
        direction="row"
        sx={{ p: 2, alignItems: 'space-between', justifyContent: 'space-between' }}
      >
        <Grid />
        <Grid />
        <Grid>
          <AddButton
            action={addObservation}
            disabled={!entryForm.formState.isValid}
            primary
            testId={existing ? 'updateObservationButtonEntry' : 'addObservationButtonEntry'}
            title={existing ? 'updateBtn.label' : 'addBtn.label'}
          />
        </Grid>
      </Grid>
    </Paper>
  );

  const page = existing ? PAGE_OBSERVATION_UPDATE : PAGE_OBSERVATION_ADD;
  return (
    <HelpShell page={page}>
      <Box sx={{ pt: 2 }}>
        <PageBannerPPT backPage={BACK_PAGE} pageNo={page} />
        <FormProvider {...entryForm}>
          <ObservationView index={0} groupIds={groupIds} />
        </FormProvider>
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
        {footer}
      </Box>
    </HelpShell>
  );
}
