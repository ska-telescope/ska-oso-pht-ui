import React from 'react';
import { useNavigate } from 'react-router';
import { useFormContext, useWatch } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@utils/storage/store';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { getSubmitPageStatuses } from '@/models/proposals/submit';
import {
  PAGE_CALIBRATION,
  PAGE_LINKING,
  PAGE_OBSERVATION,
  PAGE_OBSERVATION_ENTRY,
  PATH
} from '@utils/constants.ts';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import type { ObservationInput } from '@/models/proposals/observations';
import DeleteObservationConfirmation from '../../components/alerts/deleteObservationConfirmation/deleteObservationConfirmation';
import ObservationInPlace from './ObservationInPlace';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import TableObservations from '@/components/table/tableObservations/TableObservations';

const PAGE = PAGE_OBSERVATION;
const GAP = 4;

export default function ObservationPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { osdCyclePolicy, osdLOW, osdMID } = useOSDAccessors();

  const { application, updateAppContent1 } = storageObject.useStore();
  // The observation the user is asked to confirm deleting, while the dialog is open
  const [observationToDelete, setObservationToDelete] = React.useState<ObservationInput | null>(
    null
  );

  const form = useFormContext<ProposalType>();
  // The form has every observation, including ones still being edited
  const observations = useWatch({ control: form.control, name: 'observations' });
  useWatch({ control: form.control, name: ['targetObservation', 'calibrationStrategy'] });

  // Write submit status checks into the status store (to be deleted in future refactor). Deleting
  // an observation also deletes its links and calibration, so the Linking and Calibration pages'
  // statuses are written too
  const {
    observation: observationStatus,
    linking: linkingStatus,
    calibration: calibrationStatus
  } = getSubmitPageStatuses(form.getValues(), { low: osdLOW, mid: osdMID });
  React.useEffect(() => {
    const current = application.content1 as number[];
    if (!current || current.length <= PAGE) {
      return;
    }
    const next = current.map((value, i) =>
      i === PAGE
        ? observationStatus
        : i === PAGE_LINKING
          ? linkingStatus
          : i === PAGE_CALIBRATION
            ? calibrationStatus
            : value
    );
    if (next.every((value, i) => value === current[i])) {
      return;
    }
    updateAppContent1(next);
  }, [
    observationStatus,
    linkingStatus,
    calibrationStatus,
    application.content1,
    updateAppContent1
  ]);

  const editIconClicked = (observation: ObservationInput) =>
    navigate(PATH[2], { replace: true, state: { id: observation.id } });

  const deleteConfirmed = () => {
    const id = observationToDelete?.id;
    // The links and calibration for the observation go too; the form owns them
    form.setValue(
      'targetObservation',
      (form.getValues('targetObservation') ?? []).filter((e) => e.observationId !== id)
    );
    form.setValue(
      'calibrationStrategy',
      (form.getValues('calibrationStrategy') ?? []).filter((e) => e.observationIdRef !== id)
    );
    form.setValue(
      'observations',
      form.getValues('observations').filter((e) => e.id !== id)
    );
    setObservationToDelete(null);
  };

  const hasObservations = () => observations.length > 0;

  const noObservations = () => {
    return (
      <Grid
        container
        direction="row"
        sx={{
          alignItems: 'space-evenly',
          justifyContent: 'space-around'
        }}
      >
        <Grid size={{ md: 10 }}>
          <Alert
            color={AlertColorTypes.Warning}
            text={t('error.noObservations')}
            testId="noObservationsNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const renderAddTheButton = () => (
    <Box
      sx={{
        p: GAP,
        pt: 0
      }}
    >
      <AddButton
        action={PATH[PAGE_OBSERVATION_ENTRY]}
        primary={!hasObservations()}
        testId="addObservationButton"
        title="addObservation.button"
      />
    </Box>
  );

  const observationList = () => {
    return (
      <Box
        sx={{
          pl: GAP,
          pr: GAP
        }}
      >
        <TableObservations
          observations={observations}
          deleteFunction={setObservationToDelete}
          updateFunction={editIconClicked}
        />
        {observationToDelete && (
          <DeleteObservationConfirmation
            action={deleteConfirmed}
            observation={observationToDelete}
            open={true}
            setOpen={() => setObservationToDelete(null)}
          />
        )}
      </Box>
    );
  };

  return (
    <Shell page={PAGE} helpDisabled>
      <>
        {osdCyclePolicy?.maxObservations !== 1 && renderAddTheButton()}
        {!hasObservations() && noObservations()}
        {osdCyclePolicy?.maxObservations !== 1 && hasObservations() && observationList()}
        {osdCyclePolicy?.maxObservations === 1 && hasObservations() && <ObservationInPlace />}
      </>
    </Shell>
  );
}
