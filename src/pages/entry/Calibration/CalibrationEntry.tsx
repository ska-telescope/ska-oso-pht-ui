import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { BorderedSection, TextEntry } from '@ska-telescope/ska-gui-components';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import {
  PAGE_CALIBRATION,
  PAGE_CALIBRATION_ADD,
  PAGE_CALIBRATION_UPDATE,
  REFERENCE_COORDINATE_TYPE_SSO,
  WRAPPER_HEIGHT
} from '@utils/constants.ts';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import Proposal from '@/utils/types/proposal';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import Target from '@/utils/types/target';
import Observation from '@/utils/types/observation';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { useTheme } from '@mui/material/styles';

const GAP = 4;
const BACK_PAGE = PAGE_CALIBRATION;

const WIDTH_FIELD1 = 210;
const WIDTH_FIELD2 = 220;
const WIDTH_FIELD3 = 150;

type CalibratorSet = {
  beforeEachScan: Calibrator | null;
  afterEachScan: Calibrator | null;
};

interface CalibrationEntryProps {
  data?: CalibrationStrategy;
}

// Splits a flat Calibrator[] (as stored on CalibrationStrategy) into the
// { beforeEachScan, afterEachScan } shape the form actually works with.
function calibratorArrayToSet(list: Calibrator[]): CalibratorSet {
  if (!list) {
    return { beforeEachScan: null, afterEachScan: null };
  }
  return {
    beforeEachScan: list.find((c) => c.relativeToScan === 'before_each_scan') ?? null,
    afterEachScan: list.find((c) => c.relativeToScan === 'after_each_scan') ?? null
  };
}

export default function CalibrationEntry({ data }: CalibrationEntryProps) {
  const { t } = useScopedTranslation();
  const locationProperties = useLocation();
  const loggedIn = isLoggedIn();
  const { observatoryConstants, osdCyclePolicy } = useOSDAccessors();

  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();
  const theme = useTheme();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const isEdit = () => {
    const proposal = getProposal();
    return (
      locationProperties.state !== null ||
      data !== undefined ||
      (proposal?.calibrationStrategy && proposal.calibrationStrategy.length > 0)
    );
  };

  const PAGE = isEdit() ? PAGE_CALIBRATION_UPDATE : PAGE_CALIBRATION_ADD;

  const [, setAxiosViewError] = React.useState('');
  const [target, setTarget] = React.useState<Target>();
  const [observation, setObservation] = React.useState<Observation>();

  const [observatoryDefined, setObservatoryDefined] = React.useState(true);
  const [id, setId] = React.useState('');
  const [observationIdRef, setObservationIdRef] = React.useState('');
  const [calibrators, setCalibrators] = React.useState<CalibratorSet>({
    beforeEachScan: null,
    afterEachScan: null
  });
  const [notes, setNotes] = React.useState('');

  const calibrationIn = (inRec: CalibrationStrategy) => {
    setObservatoryDefined(inRec.observatoryDefined);
    setId(inRec.id);
    setObservationIdRef(inRec.observationIdRef);
    setCalibrators(calibratorArrayToSet(inRec.calibrators));
    setNotes(inRec.notes ? inRec.notes : '');
  };

  const calibrationOut = (): CalibrationStrategy => {
    return {
      observatoryDefined: observatoryDefined,
      id: id,
      observationIdRef: observationIdRef,
      calibrators: calibratorSetToCalibratorList(calibrators),
      notes: notes
    };
  };

  function calibratorSetToCalibratorList(calibrators: CalibratorSet): Calibrator[] | null {
    if (!calibrators.beforeEachScan || !calibrators.afterEachScan) {
      return null;
    }
    return [calibrators.beforeEachScan, calibrators.afterEachScan];
  }
  /**************************************************************/

  const getTargetObservation = (): TargetObservation | undefined => {
    const proposal = getProposal();
    if (!proposal?.targetObservation || proposal.targetObservation.length === 0) {
      return undefined;
    }
    return proposal.targetObservation.find((to) => to.observationId === observationIdRef);
  };

  const getTargetFromProposal = (targetObservation: TargetObservation): Target | undefined => {
    const proposal = getProposal();
    return proposal?.targets?.find((t) => t.id === targetObservation.targetId);
  };

  const getObservationFromProposal = (
    targetObservation: TargetObservation
  ): Observation | undefined => {
    const proposal = getProposal();
    return proposal?.observations?.find((o) => o.id === targetObservation.observationId);
  };

  React.useEffect(() => {
    setHelp('calibrator.comment.help');
    if (isEdit()) {
      const existing = data ?? locationProperties.state ?? getProposal()?.calibrationStrategy?.[0];
      calibrationIn(existing);
    } else {
    }
  }, []);

  React.useEffect(() => {
    updateStorageProposal();
  }, [notes, calibrators]);

  // Extend for Proposals when there will be more than one proposal and target as an option
  React.useEffect(() => {
    const targetObservation = getTargetObservation();
    if (!targetObservation) {
      setTarget(undefined);
      setObservation(undefined);
      return;
    }

    const target = getTargetFromProposal(targetObservation);
    const observation = getObservationFromProposal(targetObservation);

    setTarget(target);
    setObservation(observation);
  }, [observationIdRef]);
  /**************************************************************/

  function updateCalibrationOnProposal() {
    try {
      const record = {
        ...getProposal(),
        calibrationStrategy: [calibrationOut()]
      };
      setProposal(record);
    } catch (e) {
      if (e instanceof Error) {
        setAxiosViewError(e.message);
      } else {
        setAxiosViewError('error.API_UNKNOWN_ERROR');
      }
    }
  }

  const updateStorageProposal = () => {
    updateCalibrationOnProposal();
  };

  /**************************************************************/

  const isSSO = target?.kind === REFERENCE_COORDINATE_TYPE_SSO.value;

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

  const nameField = (inLabel: string, cal: Calibrator | null) => {
    return fieldWrapper(
      <TextEntry
        testId="calibratorName"
        value={cal ? cal.name : ''}
        disabled={true}
        label={t(inLabel)}
        width="100%"
      />
    );
  };
  const name1Field = () => nameField('calibrator.calibratorStart', calibrators.beforeEachScan);
  const name2Field = () => nameField('calibrator.calibratorEnd', calibrators.afterEachScan);

  const durationField = (inLabel: string, cal: Calibrator | null) => {
    return fieldWrapper(
      <TextEntry
        testId="duration"
        value={cal ? cal.durationSeconds / 60 : 0} // this is so we display the duration in minutes
        disabled={true}
        label={t(inLabel)}
        suffix={t('calibrator.minutes')}
      />
    );
  };
  const duration1Field = () =>
    durationField('calibrator.durationStart', calibrators.beforeEachScan);
  const duration2Field = () => durationField('calibrator.durationEnd', calibrators.afterEachScan);

  const intentField = (inLabel: string, cal: Calibrator | null) => {
    return fieldWrapper(
      <TextEntry
        testId="intent"
        value={cal ? cal.calibrationIntent : ''}
        disabled={true}
        label={t(inLabel)}
      />
    );
  };
  const intent1Field = () => intentField('calibrator.intentStart', calibrators.beforeEachScan);
  const intent2Field = () => intentField('calibrator.intentEnd', calibrators.afterEachScan);

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
        value={observation ? observation.supplied.value : ''}
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

  const ssoNotSupportedBox = () => (
    <Alert
      testId="alertCalibratorSSOId"
      color={AlertColorTypes.Warning}
      sx={{ textAlign: 'center', width: '100%' }}
    >
      <Typography p={GAP}>{t('sensitivityCalculatorResults.notApplicableForSSO')}</Typography>
    </Alert>
  );

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
          <Grid>
            <Typography>{t('calibrator.desc')}</Typography>
          </Grid>
          <Grid pr={10}>
            <BorderedSection
              title={t('calibrator.observatoryDefined')}
              borderColor={isSSO ? theme.palette.warning.main : undefined}
            >
              {isSSO ? (
                ssoNotSupportedBox()
              ) : (
                <>
                  {strategyRow(name1Field, duration1Field, intent1Field)}
                  {strategyRow(targetField, integrationTimeField)}
                  {strategyRow(name2Field, duration2Field, intent2Field)}
                </>
              )}
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
