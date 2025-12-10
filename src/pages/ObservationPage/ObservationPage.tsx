import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { Proposal } from '@utils/types/proposal.tsx';
import {
  validateCalibrationPage,
  validateLinkingPage,
  validateObservationPage
} from '@utils/validation/validation.tsx';
import { PAGE_CALIBRATION, PAGE_LINKING, PAGE_OBSERVATION, PATH } from '@utils/constants.ts';
import Shell from '../../components/layout/Shell/Shell';
import AddButton from '../../components/button/Add/Add';
import Alert from '../../components/alerts/standardAlert/StandardAlert';
import Observation from '../../utils/types/observation';
import DeleteObservationConfirmation from '../../components/alerts/deleteObservationConfirmation/deleteObservationConfirmation';
import ObservationEntry from '../entry/ObservationEntry/ObservationEntry';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import TableObservations from '@/components/table/tableObservations/TableObservations';

const PAGE = PAGE_OBSERVATION;
const GAP = 4;

export default function ObservationPage() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const { osdCyclePolicy } = useOSDAccessors();

  const { application, updateAppContent1, updateAppContent2 } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [currObs, setCurrObs] = React.useState<Observation | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
  const [elementsO, setElementsO] = React.useState<any[]>([]);
  const loggedIn = isLoggedIn();
  const autoLink = osdCyclePolicy?.linkObservationToObservingMode;

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number, valueLinking: number, valueCalibration: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      // validate observation page, linking page & calibration page
      temp.push(
        PAGE === i
          ? value
          : PAGE_CALIBRATION === i
          ? valueCalibration
          : PAGE_LINKING === i
          ? valueLinking
          : getProposalState()[i]
      );
    }
    updateAppContent1(temp);
  };

  const popElementO = (rec: Observation) => {
    return {
      id: rec.id,
      id2: rec.id /* Only here to satisfy syntax of DataGrid headers */,
      rec: rec,
      telescope: rec.telescope,
      subarray: rec.subarray,
      type: rec.type,
      status: 0
    };
  };

  const editIconClicked = (row: any) => {
    setCurrObs(row.rec);
    navigate(PATH[2], { replace: true, state: row.rec });
  };

  const deleteIconClicked = (row: any) => {
    setCurrObs(row.rec);
    setOpenDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const deleteConfirmed = () => {
    const obs1 = (getProposal().observations ?? []).filter(e => e.id !== currObs?.id);
    const obs2 = (getProposal().targetObservation ?? []).filter(
      e => e.observationId !== currObs?.id
    );
    const obs3 = (getProposal().groupObservations ?? []).filter(
      e => e.observationId !== currObs?.id
    );
    const obs4 = getProposal().calibrationStrategy?.filter(e => e.observationIdRef !== currObs?.id);
    setProposal({
      ...getProposal(),
      observations: obs1,
      targetObservation: obs2,
      groupObservations: obs3,
      calibrationStrategy: obs4
    });
    setElementsO(elementsO.filter(e => e.id !== currObs?.id));
    setCurrObs(null);
    closeDeleteDialog();
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    setElementsO(getProposal().observations?.map(rec => popElementO(rec)) ?? []);
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(
      validateObservationPage(getProposal()),
      validateLinkingPage(getProposal()),
      validateCalibrationPage(getProposal())
    );
  }, [validateToggle]);

  const hasObservations = () => elementsO?.length > 0;

  const hasTargetObservations = () => {
    return (getProposal()?.targetObservation?.length ?? 0) > 0;
  };

  const noObservations = () => {
    return (
      <Grid container direction="row" alignItems="space-evenly" justifyContent="space-around">
        <Grid size={{ md: 10 }}>
          <Alert
            color={AlertColorTypes.Error}
            text={loggedIn ? t('error.noObservations') : t('error.noObservationsLoggedOut')}
            testId="noObservationsNotification"
          />
        </Grid>
      </Grid>
    );
  };

  const AddTheButton = () => (
    <Box p={GAP} pt={0}>
      <AddButton
        action={PATH[2]}
        primary={!hasObservations()}
        testId="addObservationButton"
        title="addObservation.button"
      />
    </Box>
  );

  const observationList = () => {
    return (
      <Box pl={GAP} pr={GAP}>
        <TableObservations
          data={elementsO ?? []}
          deleteFunction={deleteIconClicked}
          updateFunction={editIconClicked}
        />
        {currObs && (
          <DeleteObservationConfirmation
            action={deleteConfirmed}
            observation={currObs}
            open={openDeleteDialog}
            setOpen={setOpenDeleteDialog}
          />
        )}
      </Box>
    );
  };

  return (
    <Shell page={PAGE} helpDisabled>
      <>
        {(osdCyclePolicy?.maxObservations !== 1 || !isLoggedIn()) && AddTheButton()}
        {(autoLink ? !hasTargetObservations() : !hasObservations()) && noObservations()}
        {(!isLoggedIn() || osdCyclePolicy?.maxObservations !== 1) &&
          (autoLink ? hasTargetObservations() : hasObservations()) &&
          observationList()}
        {isLoggedIn() &&
          osdCyclePolicy?.maxObservations === 1 &&
          (autoLink ? hasTargetObservations() : hasObservations()) && (
            <ObservationEntry data={getProposal()?.observations?.[0]} />
          )}
      </>
    </Shell>
  );
}
