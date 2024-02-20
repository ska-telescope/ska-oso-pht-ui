import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import CancelButton from '../../button/cancel/CancelButton';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { IconButton } from '@mui/material';

interface ObservationTargetResultsDisplayProps {
  open: boolean;
  onClose: Function;
  data: any;
  lvl: number;
}

const SIZE = 20;

export default function ObservationTargetResultsDisplay({
  open,
  onClose,
  data,
  lvl
}: ObservationTargetResultsDisplayProps) {
  const handleClose = () => {
    onClose();
  };

  const pageFooter = () => (
    <Grid container direction="row" justifyContent="space-between" alignItems="center">
      <Grid item>
        <CancelButton onClick={handleClose} label="button.close" />
      </Grid>
    </Grid>
  );

  const results = () => (
    <Grid item>
      <Grid
        container
        direction="row"
        columnSpacing={2}
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="subtitle2">Sensitivity:</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2">{data?.calculate?.data?.result?.sensitivity}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">SBS Conv Factor:</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2">{data?.weighting?.data?.weighting_factor}</Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <DialogTitle>
        <Grid
          p={2}
          container
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          {'Sensitivity Calculator Results'}
          <IconButton aria-label="SensCalc Status" style={{ cursor: 'hand' }}>
            <StatusIcon ariaTitle="" testId="statusId" icon level={lvl} size={SIZE} />
          </IconButton>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <Grid
          p={2}
          container
          direction="column"
          alignItems="space-evenly"
          justifyContent="space-around"
        >
          {data ? (
            results()
          ) : (
            <Alert testId="alertSensCalResultsId" color={AlertColorTypes.Error}>
              <Typography>No data available</Typography>
            </Alert>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
