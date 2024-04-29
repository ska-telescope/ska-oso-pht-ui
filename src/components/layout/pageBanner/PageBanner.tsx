import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import HomeButton from '../../button/Home/HomeButton';
import SaveButton from '../../button/Save/SaveButton';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/SubmitButton';
import ValidateButton from '../../button/Validate/ValidateButton';
import { LAST_PAGE, NAV, PATH } from '../../../utils/constants';
import ProposalDisplay from '../../alerts/proposalDisplay/ProposalDisplay';
import PutProposal from '../../../services/axios/putProposal/putProposal';
import { Proposal } from '../../../utils/types/proposal';
import TimedAlert from '../../../components/alerts/timedAlert/TimedAlert';
import PreviousPageButton from '../../../components/button/PreviousPage/PreviousPageButton';

interface PageBannerProps {
  pageNo: number;
  backPage?: number;
}

export default function PageBanner({ pageNo, backPage }: PageBannerProps) {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application } = storageObject.useStore();

  const [axiosValidateError, setAxiosValidateError] = React.useState('');
  const [axiosValidateErrorColor, setAxiosValidateErrorColor] = React.useState(
    AlertColorTypes.Success
  );
  const [axiosSaveError, setAxiosSaveError] = React.useState('');
  const [axiosSaveErrorColor, setAxiosSaveErrorColor] = React.useState(AlertColorTypes.Info);
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const getProposal = () => application.content2 as Proposal;

  const handleValidateClick = response => {
    setCanSubmit(false);
    if (response && !response.error) {
      // Handle successful response
      setAxiosValidateError('Success');
      setAxiosValidateErrorColor(AlertColorTypes.Success);
      setCanSubmit(true);
    } else {
      // Handle error response
      setAxiosValidateError(response.error);
      setAxiosValidateErrorColor(AlertColorTypes.Error);
    }
  };

  const prevPageNav = () => {
    navigate(NAV[backPage]);
  };

  const handleSaveClick = response => {
    if (response && !response.error) {
      // Handle successful response
      setAxiosSaveError('Success');
      setAxiosSaveErrorColor(AlertColorTypes.Success);
    } else {
      // Handle error response
      setAxiosSaveError(response.error);
      setAxiosSaveErrorColor(AlertColorTypes.Error);
    }
  };

  const submitClicked = () => {
    setOpenDialog(true);
  };

  const submitConfirmed = async () => {
    const response = await PutProposal(getProposal(), 'Submitted');
    if (response && !response.error) {
      // Handle successful response
      setAxiosSaveError(response);
      setAxiosSaveErrorColor(AlertColorTypes.Success);
      setOpenDialog(false);
      navigate(PATH[0]);
    } else {
      // Handle error response
      setAxiosSaveError(response.error);
      setAxiosSaveErrorColor(AlertColorTypes.Error);
      setOpenDialog(false);
    }
  };

  return (
    <>
      <Grid
        p={1}
        pt={1}
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
                    <PreviousPageButton
                      label={t('button.cancel')}
                      page={pageNo}
                      func={prevPageNav}
                    />
                  )}
                  {!backPage && <HomeButton />}
                </Grid>
                <Grid item>
                  {!axiosSaveError && pageNo < LAST_PAGE && (
                    <SaveButton onClick={handleSaveClick} />
                  )}
                  {axiosSaveError ? (
                    <TimedAlert
                      color={axiosSaveErrorColor}
                      text={axiosSaveError}
                      clear={setAxiosSaveError}
                    />
                  ) : null}
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
                  {!axiosValidateError && pageNo < LAST_PAGE && (
                    <ValidateButton onClick={handleValidateClick} />
                  )}
                  {axiosValidateError && (
                    <TimedAlert
                      color={axiosValidateErrorColor}
                      text={axiosValidateError}
                      clear={setAxiosValidateError}
                    />
                  )}
                </Grid>
                <Grid item>
                  {pageNo < LAST_PAGE && (
                    <SubmitButton disabled={!canSubmit} onClick={submitClicked} />
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
