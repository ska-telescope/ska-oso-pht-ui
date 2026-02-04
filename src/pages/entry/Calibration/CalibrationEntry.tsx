import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, BorderedSection, TextEntry } from '@ska-telescope/ska-gui-components';
import {
  PAGE_CALIBRATION,
  PAGE_CALIBRATION_ADD,
  PAGE_CALIBRATION_UPDATE,
  WRAPPER_HEIGHT
} from '@utils/constants.ts';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Proposal from '@/utils/types/proposal';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import GetCalibratorList from '@/services/axios/get/getCalibratorList/getCalibratorList';
import Target from '@/utils/types/target';
import Observation from '@/utils/types/observation';
import HelpShell from '@/components/layout/HelpShell/HelpShell';

const GAP = 4;
const BACK_PAGE = PAGE_CALIBRATION;

const WIDTH_FIELD1 = 210;
const WIDTH_FIELD2 = 220;
const WIDTH_FIELD3 = 150;

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

  const calibrationIn = (inRec: CalibrationStrategy) => {
    setObservatoryDefined(inRec.observatoryDefined);
    setId(inRec.id);
    setObservationIdRef(inRec.observationIdRef);
    setCalibrators(inRec.calibrators);
    setNotes(inRec.notes ? inRec.notes : '');
  };

  const calibrationOut = (): CalibrationStrategy => {
    return {
      observatoryDefined: observatoryDefined,
      id: id,
      observationIdRef: observationIdRef,
      calibrators: calibrators,
      notes: notes
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
    const proposal = getProposal();
    const found = proposal?.targetObservation && proposal.targetObservation.length > 0;
    const targetId = found ? proposal?.targetObservation?.[0].targetId : undefined;
    setTarget(found && targetId ? proposal?.targets?.find(e => e.id === targetId) : undefined);
    setObservation(found ? proposal?.observations?.[0] : undefined);
  }, [observationIdRef]);

  /**************************************************************/

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
            notes: notes
          }
        ]
      ]
    };
    setProposal(record);
  }

  const updateStorageProposal = () => {
    updateCalibrationOnProposal();
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

  const nameField = (inLabel: string) => {
    return fieldWrapper(
      <TextEntry
        testId="calibratorName"
        value={calibrator ? calibrator.name : ''}
        disabled={true}
        label={t(inLabel)}
        width="100%"
      />
    );
  };
  const name1Field = () => nameField('calibrator.calibratorStart');
  const name2Field = () => nameField('calibrator.calibratorEnd');

  const durationField = (inLabel: string) => {
    return fieldWrapper(
      <TextEntry
        testId="duration"
        value={calibrator ? calibrator.durationMin : 0}
        disabled={true}
        label={t(inLabel)}
        suffix={t('calibrator.minutes')}
      />
    );
  };
  const duration1Field = () => durationField('calibrator.durationStart');
  const duration2Field = () => durationField('calibrator.durationEnd');

  const intentField = (inLabel: string) => {
    return fieldWrapper(
      <TextEntry
        testId="intent"
        value={calibrator ? calibrator.calibrationIntent : ''}
        disabled={true}
        label={t(inLabel)}
      />
    );
  };
  const intent1Field = () => intentField('calibrator.intentStart');
  const intent2Field = () => intentField('calibrator.intentEnd');

  const targetField = () => {
    return fieldWrapper(
      <TextEntry
        testId="target"
        value={target ? target.name : ''}
        disabled={true}
        label={t('calibrator.target')}
        errorText={target ? '' : t('targets.missing')}
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
        value={observation ? observation.supplied.value : undefined}
        disabled={true}
        label={theLabel}
        suffix={theUnits}
        errorText={observation ? '' : t('observations.missing')}
      />
    );
  };

  const commentField = () => {
    const numRows = 4;

    return (
      <BorderedSection title={t('calibrator.comment.label')}>
        <TextEntry
          label=""
          testId="commentId"
          rows={numRows}
          value={notes}
          setValue={setNotes}
          onFocus={() => setHelp('calibrator.comment.help')}
        />
      </BorderedSection>
    );
  };

  /**************************************************************/

  const strategyRow = (field1: Function, field2: Function, field3?: Function) => {
    return (
      <Grid
        container
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        sx={{ flexWrap: 'nowrap', xs: 4, md: 8 }}
      >
        <Grid size="grow" minWidth={WIDTH_FIELD1}>
          {field1()}
        </Grid>
        <Grid size="grow" minWidth={WIDTH_FIELD2}>
          {field2()}
        </Grid>
        <Grid size="grow" minWidth={WIDTH_FIELD3}>
          {field3 ? field3() : null}
        </Grid>
      </Grid>
    );
  };

  /**************************************************************/

  return (
    <HelpShell page={PAGE}>
      <Box pl={GAP} pr={GAP}>
        {(!loggedIn || osdCyclePolicy?.calibrationFactoryDefined !== true) && (
          <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
        )}
        <Grid
          container
          spacing={GAP}
          direction="column"
          sx={{ overflow: 'hidden', width: '100%', xs: 4, md: 8 }}
        >
          {(getProposal()?.targets?.length ?? 0) > 0 && (
            <Box pt={1} pr={10}>
              <Alert
                color={AlertColorTypes.Warning}
                text={t('calibrator.limitReached')}
                testId="calibrationLimitPanelId"
              />
            </Box>
          )}
          <Grid>
            <Typography>{t('calibrator.desc')}</Typography>
          </Grid>
          <Grid pr={10}>
            <BorderedSection title={t('calibrator.observatoryDefined')}>
              {strategyRow(name1Field, duration1Field, intent1Field)}
              {strategyRow(targetField, integrationTimeField)}
              {strategyRow(name2Field, duration2Field, intent2Field)}
            </BorderedSection>
          </Grid>
          <Grid>
            <Typography>{t('calibrator.note')}</Typography>
            <Typography>{t('calibrator.disclaimer')}</Typography>
          </Grid>
          <Grid>
            <Grid pr={10}>{commentField()}</Grid>
          </Grid>
        </Grid>
      </Box>
    </HelpShell>
  );
}
