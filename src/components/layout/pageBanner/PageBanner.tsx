import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import HomeButton from '../../button/Home/HomeButton';
import SaveButton from '../../button/Save/SaveButton';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/SubmitButton';
import ValidateButton from '../../button/Validate/ValidateButton';
import MockProposal from '../../../services/axios/getProposal/mockProposal';
import { LAST_PAGE, PAGES } from '../../../utils/constants';
import SubmitConfirmation from '../../alerts/submitConfirmation/SubmitConfirmation';

interface PageBannerProps {
  pageNo: number;
}

export default function PageBanner({ pageNo }: PageBannerProps) {
  const [axiosValidateError, setAxiosValidateError] = React.useState('');
  const [axiosValidateErrorColor, setAxiosValidateErrorColor] = React.useState(null);
  const [axiosSaveError, setAxiosSaveError] = React.useState('');
  const [axiosSaveErrorColor, setAxiosSaveErrorColor] = React.useState(null);
  const [canSubmit, setCanSubmit] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const handleValidateClick = response => {
    setCanSubmit(false);
    if (response && !response.error) {
      // Handle successful response
      setAxiosValidateError(`Success: ${response}`);
      setAxiosValidateErrorColor(AlertColorTypes.Success);
      setCanSubmit(true);
    } else {
      // Handle error response
      setAxiosValidateError(response.error);
      setAxiosValidateErrorColor(AlertColorTypes.Error);
    }
  };

  const handleSaveClick = response => {
    if (response && !response.error) {
      // Handle successful response
      setAxiosSaveError(`Success: ${response}`);
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

  const submitConfirmed = () => {
    setOpenDialog(false); // TODO : Replace with the push Proposal function
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
                  <HomeButton />
                </Grid>
                <Grid item>{pageNo < LAST_PAGE && <SaveButton onClick={handleSaveClick} />}</Grid>
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
                {axiosValidateError ? (
                  <Alert testId="alertSaveErrorId" color={axiosValidateErrorColor}>
                    <Typography>{axiosValidateError}</Typography>
                  </Alert>
                ) : null}
                <Grid item>
                  {pageNo < LAST_PAGE && (
                    <ValidateButton onClick={handleValidateClick} proposal={MockProposal} />
                  )}
                </Grid>
                <Grid item>
                  {pageNo < LAST_PAGE && (
                    <SubmitButton disabled={canSubmit} onClick={submitClicked} />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {axiosSaveError ? (
          <Alert testId="alertSaveErrorId" color={axiosSaveErrorColor}>
            <Typography>{axiosSaveError}</Typography>
          </Alert>
        ) : null}
        <Grid item xs={2}>
          <Typography variant="h6" m={2}>
            {PAGES[pageNo].toUpperCase()}
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body1" m={2}>
            In this space should be some sort of description as to the purpose of this page,
            including guidance, how to progress, etc
          </Typography>
        </Grid>
      </Grid>
      {openDialog && (
        <SubmitConfirmation
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={submitConfirmed}
        />
      )}
    </>
  );
}
