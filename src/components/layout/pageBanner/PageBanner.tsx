'use client';

import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import HomeButton from '../../button/Home/HomeButton';
import SaveButton from '../../button/Save/SaveButton';
import StatusArray from '../../statusArray/StatusArray';
import SubmitButton from '../../button/Submit/SubmitButton';
import ValidateButton from '../../button/Validate/ValidateButton';

interface PageBannerProps {
  addPage?: number;
  title: string;
  setPage?: Function;
  proposalState?: number[];
}

export default function PageBanner({
  addPage = 0,
  setPage = null,
  title,
  proposalState
}: PageBannerProps) {
  const [axiosSaveError, setAxiosSaveError] = React.useState('');
  const [axiosSaveErrorColor, setAxiosSaveErrorColor] = React.useState(null);

  const handleSaveClick = (response: { error: React.SetStateAction<string> }) => {
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

  return (
    <Grid
      p={1}
      pt={addPage}
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
              <Grid item>{addPage === 1 && <SaveButton onClick={handleSaveClick} />}</Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            {addPage !== 0 && <StatusArray setPage={setPage} proposalState={proposalState} />}
          </Grid>
          <Grid item>
            <Grid
              container
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item>{addPage !== 0 && <ValidateButton />}</Grid>
              <Grid item>{addPage !== 0 && <SubmitButton />}</Grid>
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
          {title}
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body1" m={2}>
          In this space should be some sort of description as to the purpose of this page, including
          guidance, how to progress, etc
        </Typography>
      </Grid>
    </Grid>
  );
}
