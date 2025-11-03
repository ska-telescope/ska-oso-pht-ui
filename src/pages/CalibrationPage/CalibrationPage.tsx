import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, TickBox, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { Box, Grid, Typography } from '@mui/material';
import { validateCalibrationPage } from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { LAB_POSITION, STATUS_OK, WRAPPER_HEIGHT } from '@/utils/constants';
import GetCalibratorList from '@/services/axios/get/getCalibratorList/getCalibratorList';
import { Calibrator } from '@/utils/types/calibrationStrategy';
import { timeConversion } from '@/utils/helpersSensCalc';
import { TIME_MINS } from '@/utils/constantsSensCalc';
import { generateId } from '@/utils/helpers';
import Observation from '@/utils/types/observation';

const PAGE = 6;

export default function CalibrationPage() {
  const {
    application,
    updateAppContent1,
    updateAppContent2,
    helpComponent
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const { t } = useScopedTranslation();

  const LABEL_WIDTH = 4.5;
  const LINE_OFFSET = 30;

  const [baseObservations, setBaseObservations] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [id, setId] = React.useState('');
  const [name, setName] = React.useState('');
  const [duration, setDuration] = React.useState('');
  const [intent, setIntent] = React.useState('');
  const [target, setTarget] = React.useState('');
  const [integrationTime, setIntegrationTime] = React.useState('');
  const [addComment, setAddComment] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [axiosViewError, setAxiosViewError] = React.useState('');

  const hasObservations = () => (baseObservations?.length > 0 ? true : false);
  const errorSuffix = () => (hasObservations() ? '.noProducts' : '.noObservations');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const getProposalState = () => application.content1 as number[];
  const setTheProposalState = (value: number) => {
    const temp: number[] = [];
    for (let i = 0; i < getProposalState().length; i++) {
      temp.push(PAGE === i ? value : getProposalState()[i]);
    }
    updateAppContent1(temp);
  };

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    helpComponent(t('page.' + PAGE + '.help'));
    getData();
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateCalibrationPage());
  }, [validateToggle]);

  React.useEffect(() => {
    updateProposalWithCalibrationStrategy();
  }, [addComment, comment]);

  React.useEffect(() => {
    const results: Observation[] | undefined = getProposal()?.observations?.filter(
      ob =>
        typeof getProposal()?.targetObservation?.find(
          e => e.observationId === ob.id && e.sensCalc.statusGUI === STATUS_OK
        ) !== 'undefined'
    );
    const values = results?.map(e => ({ label: e.id, value: e.id }));
    if (values) {
      setBaseObservations([...values]);
    }
    setValidateToggle(!validateToggle);
  }, []);

  const getData = () => {
    // data from the calibrator endpoint
    getCalibratorData();
    // data from the proposal calibration strategy
    getCalibrationStrategyFromProposal();
    // observation & target info from the proposal
    getOtherProposalData();
    // update proposal with calibration strategy
    updateProposalWithCalibrationStrategy();
  };

  const updateProposalWithCalibrationStrategy = () => {
    // only define a calibration strategy if there's a linked observation
    const obsStrategy = hasObservations()
      ? {
          observatoryDefined: true,
          id: id ? id : generateId('cal-'),
          observationIdRef: getProposal().observations?.[0]?.id as string,
          calibrators: null, // we are displaying the info to the user but not storing it as per current requirements
          notes: addComment ? comment : null
        }
      : null;
    const record = {
      ...getProposal(),
      calibrationStrategy: [...(obsStrategy ? [obsStrategy] : [])]
    };
    setProposal(record);
  };

  function getOtherProposalData() {
    setTarget(getProposal().targets?.[0]?.name || '');
    setIntegrationTime(getSuppliedIntegrationTimeInMinutes());
  }

  function getCalibrationStrategyFromProposal() {
    const existingStrategy = getProposal().calibrationStrategy?.[0];
    if (existingStrategy) {
      setId(existingStrategy.id);
      setComment(existingStrategy.notes || '');
      setAddComment(existingStrategy.notes ? true : false);
    }
  }

  async function getCalibratorData() {
    const response = await GetCalibratorList();
    if (typeof response === 'string') {
      setAxiosViewError(response);
      return false;
    } else {
      setCalibratorData(response[0]); // it is assumed there is only 1 callibrator for now
      return true;
    }
  }

  const getSuppliedIntegrationTimeInMinutes = (): string => {
    const integrationTime = getProposal().observations?.[0]?.supplied; // TODO handle supplied sensitivity case in future
    let timeInMinutes = integrationTime?.value
      ? timeConversion(integrationTime?.value, integrationTime?.units, TIME_MINS)?.toFixed(2)
      : '';
    return timeInMinutes;
  };

  function setCalibratorData(calibrator: Calibrator) {
    setName(calibrator.name);
    setDuration(calibrator.durationMin.toString());
    setIntent(calibrator.calibrationIntent);
  }

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

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddComment(event.target.checked);
  };

  const checkBox = () => {
    return fieldWrapper(
      <TickBox
        label={t('calibrator.checkbox.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH}
        testId="calibratorCheckbox"
        checked={addComment}
        onChange={handleCheckboxChange}
        onFocus={() => helpComponent(t('calibrator.checkbox.help'))}
      />
    );
  };

  const nameField = () => {
    return fieldWrapper(
      <TextEntry testId="name" value={name} disabled={true} label={t('calibrator.name')} />
    );
  };

  const durationField = () => {
    return fieldWrapper(
      <TextEntry
        testId="duration"
        value={duration}
        disabled={true}
        label={t('calibrator.duration')}
        suffix={t('calibrator.minutes')}
      />
    );
  };

  const intentField = () => {
    return fieldWrapper(
      <TextEntry testId="intent" value={intent} disabled={true} label={t('calibrator.intent')} />
    );
  };

  const targetField = () => {
    return fieldWrapper(
      <TextEntry testId="target" value={target} disabled={true} label={t('calibrator.target')} />
    );
  };

  const integrationTimeField = () => {
    return fieldWrapper(
      <TextEntry
        testId="integrationTime"
        value={integrationTime}
        disabled={true}
        label={t('calibrator.integrationTime')}
        suffix={t('calibrator.minutes')}
      />
    );
  };

  const commentField = () => {
    const numRows = 3;

    return fieldWrapper(
      <Box sx={{ height: LINE_OFFSET * numRows }} ml={-1}>
        <TextEntry
          label={t('calibrator.comment.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="commenttId"
          rows={numRows}
          value={comment}
          setValue={setComment}
          onFocus={() => helpComponent(t('calibrator.comment.help'))}
        />
      </Box>
    );
  };

  const calibrationDetails = (): React.ReactNode => {
    return (
      <>
        <Typography mb={3}>{t('calibrator.detail')}</Typography>
        <Grid pt={1} container direction="row" alignItems="baseline" justifyContent="flex-start">
          {nameField()}
          {durationField()}
          {intentField()}
        </Grid>
        <Grid pt={1} container direction="row" alignItems="baseline" justifyContent="flex-start">
          {targetField()}
          {integrationTimeField()}
        </Grid>
        <Grid pt={1} container direction="row" alignItems="baseline" justifyContent="flex-start">
          {nameField()}
          {durationField()}
          {intentField()}
        </Grid>
        <Typography mt={3}>{t('calibrator.note')}</Typography>
        <Typography mb={3}>{t('calibrator.disclaimer')}</Typography>
        {checkBox()}
        {addComment && commentField()}
      </>
    );
  };

  return (
    <Shell page={PAGE}>
      <>
        {hasObservations() && (
          <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="center">
            <Grid size={{ xs: 6 }}>
              <Grid
                p={1}
                container
                direction="column"
                alignItems="space-evenly"
                justifyContent="center"
              >
                <Grid>
                  {!axiosViewError && calibrationDetails()}
                  {axiosViewError && (
                    <Alert
                      color={AlertColorTypes.Error}
                      testId="axiosErrorTestId"
                      text={axiosViewError}
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid pt={4} size={{ xs: 4 }}>
              <HelpPanel />
            </Grid>
          </Grid>
        )}
        {!hasObservations() && (
          <Alert
            color={AlertColorTypes.Error}
            text={t('page.' + PAGE + errorSuffix())}
            testId="helpPanelId"
          />
        )}
      </>
    </Shell>
  );
}
