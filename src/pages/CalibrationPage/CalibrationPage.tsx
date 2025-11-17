import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  TextEntry,
  TickBox,
  AlertColorTypes,
  LABEL_POSITION,
  SPACER_VERTICAL,
  Spacer,
  InfoCard,
  InfoCardColorTypes
} from '@ska-telescope/ska-gui-components';
import { Box, Grid, Typography } from '@mui/material';
import { validateCalibrationPage } from '@utils/validation/validation.tsx';
import { Proposal } from '@utils/types/proposal.tsx';
import Shell from '../../components/layout/Shell/Shell';
import Alert from '@/components/alerts/standardAlert/StandardAlert';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import {
  FOOTER_SPACER,
  HELP_FONT,
  LAB_POSITION,
  PAGE_CALIBRATION,
  STATUS_OK,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import GetCalibratorList from '@/services/axios/get/getCalibratorList/getCalibratorList';
import { CalibrationStrategy, Calibrator } from '@/utils/types/calibrationStrategy';
import { timeConversion } from '@/utils/helpersSensCalc';
import { TIME_MINS } from '@/utils/constantsSensCalc';
import Observation from '@/utils/types/observation';
import ArrowIcon from '@/components/icon/arrowIcon/arrowIcon';
import Supplied from '@/utils/types/supplied';

const PAGE = PAGE_CALIBRATION;
const LINE_OFFSET = 35; // TODO check why we need to set this for it to be visible

export default function CalibrationPage() {
  const {
    application,
    updateAppContent1,
    updateAppContent2,
    helpComponent
  } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const { t } = useScopedTranslation();

  const LABEL_WIDTH = 1;
  const LABEL_WIDTH_CHECKBOX = 11.5;

  const [baseObservations, setBaseObservations] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [calibrationStrategy, setCalibrationStrategy] = React.useState<CalibrationStrategy | null>(
    null
  );
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
    setTheProposalState(validateCalibrationPage(getProposal()));
  }, [validateToggle]);

  React.useEffect(() => {
    updateProposalWithCalibrationStrategy();
  }, [addComment, comment]);

  React.useEffect(() => {
    getOtherProposalData();
  }, [calibrationStrategy]);

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
    // data from the proposal calibration strategy
    getCalibrationStrategyFromProposal();
    // data from the calibrator endpoint
    getCalibratorData();
  };

  function updateProposalWithCalibrationStrategy() {
    if (calibrationStrategy === null) {
      return;
    }
    const record = {
      ...getProposal(),
      calibrationStrategy: [
        ...[
          {
            ...(calibrationStrategy as CalibrationStrategy),
            observatoryDefined: calibrationStrategy?.observatoryDefined,
            id: calibrationStrategy?.id,
            observationIdRef: calibrationStrategy?.observationIdRef,
            calibrators: calibrationStrategy?.calibrators,
            isAddNote: addComment,
            notes: addComment ? comment : null
          }
        ]
      ]
    };
    setProposal(record);
  }

  function getTargetName(): string {
    const targetId = (getProposal().targetObservation ?? []).find(
      e => e.observationId === calibrationStrategy?.observationIdRef
    )?.targetId;
    return getProposal().targets?.find(e => e.id === targetId)?.name ?? '';
  }

  function getIntegrationTime(): string {
    const supplied = (getProposal().observations ?? []).find(
      e => e.id === calibrationStrategy?.observationIdRef
    )?.supplied;
    return supplied ? getSuppliedIntegrationTimeInMinutes(supplied) : '';
  }

  function getOtherProposalData() {
    if (!calibrationStrategy) {
      return;
    }
    const targetName = getTargetName();
    setTarget(targetName);
    const integrationTime = getIntegrationTime();
    setIntegrationTime(integrationTime);
  }

  function getCalibrationStrategyFromProposal() {
    const existingStrategy: CalibrationStrategy = getProposal().calibrationStrategy?.[0]; // assumes only 1 calibration strategy for now
    if (existingStrategy) {
      setComment(existingStrategy.notes || '');
      setAddComment(existingStrategy.isAddNote);
      setCalibrationStrategy(existingStrategy);
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

  const getSuppliedIntegrationTimeInMinutes = (supplied: Supplied): string => {
    const integrationTime = supplied; // TODO this assumes integration time, handle supplied sensitivity case in future
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
        labelWidth={LABEL_WIDTH_CHECKBOX}
        labelPosition={LABEL_POSITION.END}
        testId="calibratorCheckbox"
        checked={addComment}
        onChange={handleCheckboxChange}
        onFocus={() => helpComponent(t('calibrator.checkbox.help'))}
      />
    );
  };

  const nameField = () => {
    return fieldWrapper(
      <TextEntry
        testId="calibratorName"
        value={name}
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
    const numRows = 4;

    function validateComment(inc: string) {
      if (addComment && (!inc || inc?.length === 0)) {
        return `${t('title.empty')}`;
      }
    }

    return (
      <Box pr={1} sx={{ height: LINE_OFFSET * numRows, xs: 4, md: 8 }}>
        <TextEntry
          label={t('calibrator.comment.label')}
          labelBold
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH}
          testId="commenttId"
          rows={numRows}
          errorText={validateComment(comment)}
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
        <Grid sx={{ overflow: 'hidden', width: '100%', xs: 4, md: 8 }}>
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
            <Grid size="grow" minWidth={210}>
              {nameField()}
            </Grid>
            <Grid size="grow" minWidth={220}>
              {durationField()}
            </Grid>
            <Grid size="grow" minWidth={150}>
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
            <Grid size="grow" minWidth={210}>
              {targetField()}
            </Grid>
            <Grid size="grow" minWidth={220}>
              {integrationTimeField()}
            </Grid>
            <Grid size="grow" minWidth={150}></Grid>
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
            <Grid size="grow" minWidth={210}>
              {nameField()}
            </Grid>
            <Grid size="grow" minWidth={220}>
              {durationField()}
            </Grid>
            <Grid size="grow" minWidth={150}>
              {intentField()}
            </Grid>
          </Grid>
          <Grid pt={5}>
            <Typography mt={3}>{t('calibrator.note')}</Typography>
            <Typography mb={3}>{t('calibrator.disclaimer')}</Typography>
          </Grid>
          <Grid container direction="row" alignItems="center" justifyContent="flex-start">
            <Grid size="grow">
              <Grid mr={3} mt={-2}>
                {checkBox()}
              </Grid>
              <Grid mr={3} mt={-2}>
                {addComment && commentField()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  };

  return (
    <Shell page={PAGE}>
      <>
        {hasObservations() && (
          <Grid
            p={1}
            container
            direction="row"
            alignItems="space-evenly"
            justifyContent="center"
            spacing={1}
          >
            <Grid size={{ xs: 4, md: 8 }} sx={{ position: 'relative' }}>
              {!axiosViewError && calibrationDetails()}
              {axiosViewError && (
                <Alert
                  color={AlertColorTypes.Error}
                  testId="axiosErrorTestId"
                  text={axiosViewError}
                />
              )}
              {(getProposal()?.targets?.length ?? 0) > 0 && (
                <Box pt={2} pr={5}>
                  <InfoCard
                    color={InfoCardColorTypes.Warning}
                    fontSize={HELP_FONT}
                    message={t('calibrator.limitReached')}
                    testId="calibrationLimitPanelId"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        )}
        {!hasObservations() && (
          <Grid
            p={10}
            container
            direction="column"
            alignItems="space-evenly"
            justifyContent="space-around"
          >
            <Alert
              color={AlertColorTypes.Error}
              text={t('page.' + PAGE + errorSuffix())}
              testId="helpPanelId"
            />
          </Grid>
        )}
      </>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
    </Shell>
  );
}
