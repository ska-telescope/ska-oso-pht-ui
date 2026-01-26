import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BorderedSection,
  TextEntry,
  InfoCard,
  InfoCardColorTypes,
  SPACER_VERTICAL,
  Spacer
} from '@ska-telescope/ska-gui-components';
import {
  FOOTER_SPACER,
  HELP_FONT,
  NAV,
  FOOTER_HEIGHT_PHT,
  PAGE_CALIBRATION,
  PAGE_CALIBRATION_ADD,
  PAGE_CALIBRATION_UPDATE,
  WRAPPER_HEIGHT
} from '@utils/constants.ts';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Proposal from '@/utils/types/proposal';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import ArrowIcon from '@/components/icon/arrowIcon/arrowIcon';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import GetCalibratorList from '@/services/axios/get/getCalibratorList/getCalibratorList';
import Target from '@/utils/types/target';
import Observation from '@/utils/types/observation';
import AddButton from '@/components/button/Add/Add';
import HelpShell from '@/components/layout/HelpShell/HelpShell';

const GAP = 4;
const BACK_PAGE = PAGE_CALIBRATION;

const WIDTH_NAME = 210;
const WIDTH_DURATION = 220;
const WIDTH_INTENT = 150;
const WIDTH_TARGET = 210;
const WIDTH_INTEGRATION_TIME = 220;

interface CalibrationEntryProps {
  data?: CalibrationStrategy;
}

export default function CalibrationEntry({ data }: CalibrationEntryProps) {
  const { t } = useScopedTranslation();
  const locationProperties = useLocation();
  const loggedIn = isLoggedIn();
  const { observatoryConstants, osdCyclePolicy } = useOSDAccessors();

  const isEdit = () => locationProperties.state !== null || data !== undefined;
  const PAGE = isEdit() ? PAGE_CALIBRATION_UPDATE : PAGE_CALIBRATION_ADD;
  const navigate = useNavigate();
  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [, setAxiosViewError] = React.useState('');
  const [calibrator, setCalibrator] = React.useState<Calibrator>();
  const [target, setTarget] = React.useState<Target>();
  const [observation, setObservation] = React.useState<Observation>();

  const [observatoryDefined, setObservatoryDefined] = React.useState(true);
  const [id, setId] = React.useState('');
  const [observationIdRef, setObservationIdRef] = React.useState('');
  const [calibrators, setCalibrators] = React.useState<Calibrator[] | null>(null);
  const [notes, setNotes] = React.useState('');
  const [addNotes, setAddNotes] = React.useState(false);

  const calibrationIn = (inRec: CalibrationStrategy) => {
    setObservatoryDefined(inRec.observatoryDefined);
    setId(inRec.id);
    setObservationIdRef(inRec.observationIdRef);
    setCalibrators(inRec.calibrators);
    setNotes(inRec.notes ? inRec.notes : '');
    setAddNotes(inRec.notes && inRec.notes.length > 0 ? true : false);
  };

  const calibrationOut = (): CalibrationStrategy => {
    return {
      observatoryDefined: observatoryDefined,
      id: id,
      observationIdRef: observationIdRef,
      calibrators: calibrators,
      notes: addNotes ? notes : null
    } as CalibrationStrategy;
  };

  /**************************************************************/

  React.useEffect(() => {
    setHelp('calibrator.comment.help');
    if (isEdit()) {
      calibrationIn(data ? data : locationProperties.state);
    }
    getCalibratorData();
  }, []);

  async function getCalibratorData() {
    const response = await GetCalibratorList();
    if (typeof response === 'string') {
      setAxiosViewError(response);
      return false;
    } else {
      setCalibrator(response[0]); // NOTE : it is assumed there is only 1 calibrator for now
      return true;
    }
  }

  React.useEffect(() => {
    updateStorageProposal();
  }, [notes]);

  // TODO : Extend for Proposals when there will be more than one proposal and target as an option
  React.useEffect(() => {
    setTarget(getProposal()?.targets?.[0]);
    setObservation(getProposal()?.observations?.[0]);
  }, [observationIdRef]);

  /**************************************************************/

  const addCalibrationToProposal = () => {
    const newCalibration: CalibrationStrategy = calibrationOut();
    setProposal({
      ...getProposal(),
      calibrationStrategy: [...(getProposal().calibrationStrategy ?? []), newCalibration]
    });
  };

  function updateCalibrationOnProposal() {
    const newStrategy: CalibrationStrategy = calibrationOut();
    const record = {
      ...getProposal(),
      calibrationStrategy: [
        ...[
          {
            ...(newStrategy as CalibrationStrategy),
            observatoryDefined: newStrategy?.observatoryDefined,
            id: newStrategy?.id,
            observationIdRef: newStrategy?.observationIdRef,
            calibrators: newStrategy?.calibrators,
            notes: addNotes ? notes : null
          }
        ]
      ]
    };
    setProposal(record);
  }

  const updateStorageProposal = () => {
    if (loggedIn && (osdCyclePolicy?.maxObservations ?? 1) === 1) {
      isEdit() ? updateCalibrationOnProposal() : addCalibrationToProposal();
    }
  };

  /**************************************************************/

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box
      p={0}
      mr={10}
      pt={1}
      sx={{
        height: WRAPPER_HEIGHT,
        width: 'auto'
      }}
    >
      {children}
    </Box>
  );

  const nameField = () => {
    return fieldWrapper(
      <TextEntry
        testId="calibratorName"
        value={calibrator ? calibrator.name : ''}
        disabled={true}
        label={t('calibrator.calibrator')}
        width="100%"
      />
    );
  };

  const durationField = () => {
    return fieldWrapper(
      <TextEntry
        testId="duration"
        value={calibrator ? calibrator.durationMin : 0}
        disabled={true}
        label={t('calibrator.duration')}
        suffix={t('calibrator.minutes')}
      />
    );
  };

  const intentField = () => {
    return fieldWrapper(
      <TextEntry
        testId="intent"
        value={calibrator ? calibrator.calibrationIntent : ''}
        disabled={true}
        label={t('calibrator.intent')}
      />
    );
  };

  const targetField = () => {
    return fieldWrapper(
      <TextEntry
        testId="target"
        value={target ? target.name : ''}
        disabled={true}
        label={t('calibrator.target')}
      />
    );
  };

  const integrationTimeField = () => {
    const theType = observation ? observation.supplied.type : 0;
    const obUnits = observation ? observation.supplied.units : 1;
    const theLabel = t(theType ? 'calibrator.integrationTime' : 'calibrator.integrationTime');
    const theUnits = observatoryConstants.Supplied[theType - 1]?.units[obUnits - 1].label;
    return fieldWrapper(
      <TextEntry
        testId="integrationTime"
        value={observation ? observation.supplied.value : 1}
        disabled={true}
        label={theLabel}
        suffix={theUnits}
      />
    );
  };

  const commentField = () => {
    const numRows = 4;

    function validateComment(inc: string) {
      if (addNotes && (!inc || inc?.length === 0)) {
        return `${t('title.empty')}`;
      }
    }

    return (
      <BorderedSection title={t('calibrator.comment.label')}>
        <TextEntry
          label=""
          testId="commentId"
          rows={numRows}
          errorText={validateComment(notes)}
          value={notes}
          setValue={setNotes}
          onFocus={() => setHelp('calibrator.comment.help')}
        />
      </BorderedSection>
    );
  };

  /**************************************************************/

  // const validateId = () =>
  //   getProposal()?.calibrationStrategy?.find(t => t.id === id) ? t('calibrationId.notUnique') : '';

  const addButtonDisabled = () => {
    return true; // isEdit() ? false : validateId() ? true : false;
  };

  const pageFooter = () => {
    const buttonClicked = () => {
      isEdit() ? updateCalibrationOnProposal() : addCalibrationToProposal();
      if (!loggedIn || (osdCyclePolicy?.maxObservations ?? 1) !== 1) {
        navigate(NAV[BACK_PAGE]);
      }
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom:
            FOOTER_HEIGHT_PHT + (loggedIn && (osdCyclePolicy?.maxObservations ?? 1) === 1 ? 60 : 0),
          left: 0,
          right: loggedIn && (osdCyclePolicy?.maxObservations ?? 1) === 1 ? 30 : 0
        }}
        elevation={0}
      >
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid />
          <Grid />
          <Grid>
            {(!loggedIn || (osdCyclePolicy?.maxObservations ?? 1) !== 1) && (
              <AddButton
                action={buttonClicked}
                disabled={addButtonDisabled()}
                primary
                testId={isEdit() ? 'updateCalibrationButtonEntry' : 'addCalibrationButtonEntry'}
                title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  /**************************************************************/

  return (
    <HelpShell page={PAGE}>
      <Box pl={GAP} pr={GAP}>
        {(!loggedIn || (osdCyclePolicy?.maxObservations ?? 1) > 1) && (
          <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
        )}
        <Grid sx={{ overflow: 'hidden', width: '100%', xs: 4, md: 8 }}>
          {(getProposal()?.targets?.length ?? 0) > 0 && (
            <Box pt={1} pr={10}>
              <InfoCard
                color={InfoCardColorTypes.Warning}
                fontSize={HELP_FONT}
                message={t('calibrator.limitReached')}
                testId="calibrationLimitPanelId"
              />
            </Box>
          )}
          <Grid pt={2} pb={4}>
            <Typography>{t('calibrator.desc')}</Typography>
          </Grid>
          <Grid
            pt={1}
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            sx={{ flexWrap: 'nowrap', xs: 4, md: 8 }}
          >
            <Grid width={50} pt={4} mr={5}>
              <ArrowIcon disabled onClick={() => {}} />
            </Grid>
            <Grid size="grow" minWidth={WIDTH_NAME}>
              {nameField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_DURATION}>
              {durationField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_INTENT}>
              {intentField()}
            </Grid>
          </Grid>
          <Grid
            pt={1}
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            sx={{ flexWrap: 'nowrap', xs: 4, md: 8 }}
          >
            <Grid width={50} pt={5} mr={5}>
              <ArrowIcon disabled onClick={() => {}} />
            </Grid>
            <Grid size="grow" minWidth={WIDTH_TARGET}>
              {targetField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_INTEGRATION_TIME}>
              {integrationTimeField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_INTENT}></Grid>
          </Grid>
          <Grid
            pt={1}
            container
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
            sx={{ flexWrap: 'nowrap', xs: 4, md: 8 }}
          >
            <Grid width={50} pt={4} mr={5}>
              <ArrowIcon disabled onClick={() => {}} />
            </Grid>
            <Grid size="grow" minWidth={WIDTH_NAME}>
              {nameField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_DURATION}>
              {durationField()}
            </Grid>
            <Grid size="grow" minWidth={WIDTH_INTENT}>
              {intentField()}
            </Grid>
          </Grid>
          <Grid pt={5}>
            <Typography mt={3}>{t('calibrator.note')}</Typography>
            <Typography mb={3}>{t('calibrator.disclaimer')}</Typography>
          </Grid>
          <Grid container direction="row" alignItems="center" justifyContent="flex-start">
            <Grid size="grow">
              <Grid mr={3}>{commentField()}</Grid>
            </Grid>
          </Grid>
        </Grid>
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
        {pageFooter()}
      </Box>
    </HelpShell>
  );
}
