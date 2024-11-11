import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import HomeButton from '../../button/Home/Home';
import SaveButton from '../../button/Save/Save';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/Submit';
import ValidateButton from '../../button/Validate/Validate';
import { LAST_PAGE, NAV, PATH, PROPOSAL_STATUS } from '../../../utils/constants';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import ValidationResults from '../../alerts/validationResults/ValidationResults';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import Notification from '../../../utils/types/notification';
import { Proposal } from '../../../utils/types/proposal';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposalValidate from '../../../services/axios/postProposalValidate/postProposalValidate';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme from '@mui/material/styles/useTheme';

interface PageBannerProps {
  pageNo: number;
  backPage?: number;
}

export default function PageBanner({ pageNo, backPage }: PageBannerProps) {
  const LG = () => useMediaQuery(useTheme().breakpoints.down('lg'));
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent5 } = storageObject.useStore();
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openProposalDisplay, setOpenProposalDisplay] = React.useState(false);
  const [openValidationResults, setOpenValidationResults] = React.useState(false);
  const [validationResults, setValidationResults] = React.useState(null);

  const getProposal = () => application.content2 as Proposal;

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      message: t(str),
      okRequired: false
    };
    updateAppContent5(rec);
  }
  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);

  const validateTooltip = () => {
    return 'validationBtn.tooltip';
  };

  const validateClicked = () => {
    const ValidateTheProposal = async () => {
      const response = await PostProposalValidate(getProposal());
      if (response.valid && !response.error) {
        setValidationResults(null);
        NotifyOK(`validationBtn.${response.valid}`);
        setCanSubmit(true);
      } else {
        setValidationResults(response.error);
        setOpenValidationResults(true);
        setCanSubmit(false);
      }
    };
    ValidateTheProposal();
  };

  const prevPageNav = () => {
    navigate(NAV[backPage]);
  };

  const updateProposalResponse = response => {
    if (response && !response.error) {
      NotifyOK('saveBtn.success');
    } else {
      NotifyError(response.error);
    }
  };

  const updateProposal = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.DRAFT);
    updateProposalResponse(response);
  };

  const submitClicked = () => {
    setOpenProposalDisplay(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.SUBMITTED);
    if (response && !response.error) {
      NotifyOK(response.valid);
      setOpenProposalDisplay(false);
      navigate(PATH[0]);
    } else {
      NotifyError(response.error);
      setOpenProposalDisplay(false);
    }
  };

  const pageTitle = () => (
    <Typography id="pageTitle" variant="h6" m={2}>
      {LG()
        ? t(`page.${pageNo}.titleShort`).toUpperCase()
        : t(`page.${pageNo}.title`).toUpperCase()}
    </Typography>
  );

  const pageDesc = () => (
    <Typography id="pageDesc" variant="body1" m={2}>
      {t(`page.${pageNo}.desc`)}
    </Typography>
  );

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pl={2}
    >
      <Grid item>
        {backPage > 0 && <PreviousPageButton title="button.cancel" action={prevPageNav} />}
        {!backPage && <HomeButton testId="homeButtonTestId" />}
      </Grid>
      <Grid item>
        {pageNo < LAST_PAGE && (
          <SaveButton action={() => updateProposal()} primary testId="saveButtonTestId" />
        )}
      </Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      pr={2}
    >
      <Grid item>
        {pageNo < LAST_PAGE && (
          <ValidateButton action={validateClicked} toolTip={validateTooltip()} />
        )}
      </Grid>
      <Grid item>
        {pageNo < LAST_PAGE && <SubmitButton action={submitClicked} disabled={!canSubmit} />}
      </Grid>
    </Grid>
  );

  const row1 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item>{buttonsLeft()}</Grid>

      <Grid item xs={7} display={{ xs: 'none', lg: 'block' }}>
        {pageNo < LAST_PAGE && <StatusArray />}
      </Grid>

      <Grid item display={{ xs: 'block', lg: 'none' }}>
        {pageTitle()}
      </Grid>

      <Grid item>{buttonsRight()}</Grid>
    </Grid>
  );

  const row2 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={12} display={{ xs: 'block', lg: 'none' }}>
        {pageNo < LAST_PAGE && <StatusArray />}
      </Grid>
    </Grid>
  );

  const row3 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item display={{ xs: 'none', lg: 'block' }}>
        {pageTitle()}
      </Grid>
      <Grid item xs={8}>
        {pageDesc()}
      </Grid>
    </Grid>
  );

  return (
    <Box p={2}>
      {row1()}
      {row2()}
      {row3()}
      {openProposalDisplay && (
        <ProposalDisplay
          proposal={getProposal()}
          open={openProposalDisplay}
          onClose={() => setOpenProposalDisplay(false)}
          onConfirm={submitConfirmed}
          onConfirmLabel={t('button.confirmSubmit')}
        />
      )}
      {openValidationResults && (
        <ValidationResults
          open={openValidationResults}
          onClose={() => setOpenValidationResults(false)}
          proposal={getProposal()}
          results={validationResults}
        />
      )}
    </Box>
  );
}
