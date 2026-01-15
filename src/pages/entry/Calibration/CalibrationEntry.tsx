import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  TextEntry,
  TickBox,
  LABEL_POSITION,
  InfoCard,
  InfoCardColorTypes
} from '@ska-telescope/ska-gui-components';
import {
  HELP_FONT,
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

const GAP = 4;
const LINE_OFFSET = 35; // TODO check why we need to set this for it to be visible
const LABEL_WIDTH_CHECKBOX = 11.5;
const BACK_PAGE = PAGE_CALIBRATION;

interface CalibrationEntryProps {
  data?: CalibrationStrategy;
}

export default function CalibrationEntry({ data }: CalibrationEntryProps) {
  const { t } = useScopedTranslation();
  const locationProperties = useLocation();
  const loggedIn = isLoggedIn();
  const { osdCyclePolicy } = useOSDAccessors();

  const isEdit = () => locationProperties.state !== null || data !== undefined;
  const PAGE = isEdit() ? PAGE_CALIBRATION_UPDATE : PAGE_CALIBRATION_ADD;

  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [, setAxiosViewError] = React.useState('');
  const [calibrator, setCalibrator] = React.useState<Calibrator>();

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
    setHelp('page.' + PAGE + '.help');
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

  /**************************************************************/

  function addCalibrationOnProposal() {
    return;
  }

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
            isAddNote: addNotes,
            notes: addNotes ? notes : null
          }
        ]
      ]
    };
    setProposal(record);
  }

  const updateStorageProposal = () => {
    if (loggedIn && (osdCyclePolicy?.maxObservations ?? 1) === 1) {
      isEdit() ? updateCalibrationOnProposal() : addCalibrationOnProposal();
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
        value={1 /*target*/}
        disabled={true}
        label={t('calibrator.target')}
      />
    );
  };

  const integrationTimeField = () => {
    return fieldWrapper(
      <TextEntry
        testId="integrationTime"
        value={1} //integrationTime}
        disabled={true}
        label={t('calibrator.integrationTime')}
        suffix={t('calibrator.minutes')}
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
      <Box pr={1} sx={{ height: LINE_OFFSET * numRows, xs: 4, md: 8 }}>
        <TextEntry
          label={t('calibrator.comment.label')}
          testId="commentId"
          rows={numRows}
          errorText={validateComment(notes)}
          value={notes}
          setValue={setNotes}
          onFocus={() => setHelp('calibrator.comment.help')}
        />
      </Box>
    );
  };

  const checkBox = () => {
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddNotes(event.target.checked);
    };

    return fieldWrapper(
      <TickBox
        label={t('calibrator.checkbox.label')}
        labelBold
        labelWidth={LABEL_WIDTH_CHECKBOX}
        labelPosition={LABEL_POSITION.END}
        testId="calibratorCheckbox"
        checked={addNotes}
        onChange={handleCheckboxChange}
        onFocus={() => setHelp('calibrator.checkbox.help')}
      />
    );
  };

  /**************************************************************/

  return (
    <Box pl={GAP}>
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
              {addNotes && commentField()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
