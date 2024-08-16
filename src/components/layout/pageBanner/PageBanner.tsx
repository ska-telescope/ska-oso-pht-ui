import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import HomeButton from '../../button/Home/Home';
import SaveButton from '../../button/Save/Save';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/Submit';
import ValidateButton from '../../button/Validate/Validate';
import { LAST_PAGE, NAV, PATH, PROPOSAL_STATUS } from '../../../utils/constants';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import Notification from '../../../utils/types/notification';
import { Proposal } from '../../../utils/types/proposal';
import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposalValidate from '../../../services/axios/postProposalValidate/postProposalValidate';

interface PageBannerProps {
  pageNo: number;
  backPage?: number;
}

export default function PageBanner({ pageNo, backPage }: PageBannerProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, updateAppContent5 } = storageObject.useStore();
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

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

  const validateClicked = () => {
    const ValidateTheProposal = async () => {
      const response = await PostProposalValidate(getProposal());
      if (response && !response.error) {
        NotifyOK('validationBtn.success');
        setCanSubmit(true);
      } else {
        NotifyError(response.error);
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
    setOpenDialog(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(getProposal(), PROPOSAL_STATUS.SUBMITTED);
    if (response && !response.error) {
      NotifyOK(response);
      setOpenDialog(false);
      navigate(PATH[0]);
    } else {
      NotifyError(response.error);
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Grid
        pl={2}
        pr={2}
        container
        direction="row"
        alignItems="center"
        justifyContent="space-around"
      >
        <Grid item xs={12}>
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item>
              <Grid
                container
                spacing={1}
                direction="row"
                alignItems="flex-end"
                justifyContent="space-between"
              >
                <Grid item>
                  {backPage > 0 && (
                    <PreviousPageButton label={t('button.cancel')} action={prevPageNav} />
                  )}
                  {!backPage && <HomeButton testId="homeButtonTestId" />}
                </Grid>
                <Grid item>
                  {pageNo < LAST_PAGE && (
                    <SaveButton action={() => updateProposal()} primary testId="saveButtonTestId" />
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              {pageNo < LAST_PAGE && <StatusArray />}
            </Grid>
            <Grid item>
              <Grid
                container
                spacing={1}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item>
                  {pageNo < LAST_PAGE && <ValidateButton action={validateClicked} />}
                </Grid>
                <Grid item>
                  {pageNo < LAST_PAGE && (
                    <SubmitButton disabled={!canSubmit} action={submitClicked} />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Typography id="pageTitle" variant="h6" m={2}>
            {t(`page.${pageNo}.title`).toUpperCase()}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography id="pageDesc" variant="body1" m={2}>
            {t(`page.${pageNo}.desc`)}
          </Typography>
        </Grid>
      </Grid>
      {openDialog && (
        <ProposalDisplay
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={submitConfirmed}
          onConfirmLabel={t('button.confirmSubmit')}
        />
      )}
    </>
  );
}
