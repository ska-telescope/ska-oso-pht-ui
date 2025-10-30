import React from 'react';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, TickBox } from '@ska-telescope/ska-gui-components';
import { Box, Grid, Typography } from '@mui/material';
import { validateCalibrationPage } from '../../utils/validation/validation';
import { Proposal } from '../../utils/types/proposal';
import Shell from '../../components/layout/Shell/Shell';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { LAB_POSITION, WRAPPER_HEIGHT } from '@/utils/constants';

const PAGE = 6;

export default function CalibrationPage() {
  const { application, updateAppContent1, helpComponent } = storageObject.useStore();
  const [validateToggle, setValidateToggle] = React.useState(false);

  const { t } = useScopedTranslation();

  const LABEL_WIDTH = 4.5;
  const LINE_OFFSET = 30;

  // const [name, setName] = React.useState('');
  const [addComment, setAddComment] = React.useState(false);
  const [comment, setComment] = React.useState('');

  const getProposal = () => application.content2 as Proposal;

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
  }, []);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [getProposal()]);

  React.useEffect(() => {
    setTheProposalState(validateCalibrationPage());
  }, [validateToggle]);

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box
      p={0}
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
    return (
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
      <TextEntry
        testId="name"
        // value={name}
        value="test name"
        onFocus={() => helpComponent(t('name.help'))}
        required
        disabled={true}
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
          // required
          value={comment}
          setValue={setComment}
          onFocus={() => helpComponent(t('calibrator.comment.help'))}
          // helperText={helperFunction(getProposal().abstract as string)}
          // errorText={validateWordCount(getProposal().abstract as string)}
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
          {nameField()}
          {nameField()}
        </Grid>
        <Grid pt={1} container direction="row" alignItems="baseline" justifyContent="flex-start">
          {nameField()}
          {nameField()}
        </Grid>
        <Grid pt={1} container direction="row" alignItems="baseline" justifyContent="flex-start">
          {nameField()}
          {nameField()}
          {nameField()}
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
      <Grid p={1} container direction="row" alignItems="space-evenly" justifyContent="center">
        <Grid size={{ xs: 6 }}>
          <Grid
            p={1}
            container
            direction="column"
            alignItems="space-evenly"
            justifyContent="center"
          >
            <Grid>{calibrationDetails()}</Grid>
          </Grid>
        </Grid>
        <Grid pt={4} size={{ xs: 4 }}>
          <HelpPanel />
        </Grid>
      </Grid>
    </Shell>
  );
}
