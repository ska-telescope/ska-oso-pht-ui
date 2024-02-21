import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from '@mui/material';
import CancelButton from '../../button/cancel/CancelButton';
import { Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface ObservationTargetResultsDisplayProps {
  open: boolean;
  onClose: Function;
  data: any;
  lvl: number;
  observation: any;
}

const SIZE = 30;

export default function ObservationTargetResultsDisplay({
  open,
  onClose,
  data,
  lvl,
  observation
}: ObservationTargetResultsDisplayProps) {
  const handleClose = () => {
    onClose();
  };

  const { t } = useTranslation('pht');

  // Sens Cal API returns different format for Mid and Low endpoints
  const getsensitivity = () => {
    if (observation.telescope === 1) {
      return data?.calculate?.data?.result?.sensitivity;
    }
    return data?.calculate?.sensitivity;
  };

  const getweightingFactor = () => {
    if (observation.telescope === 1) {
      return data?.weighting?.data?.weighting_factor;
    }
    return data?.weighting?.weighting_factor;
  };

  const pageFooter = () => (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 3, ml: 3 }}
    >
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
          <Typography variant="body2" id="sensitivityId">
            {getsensitivity()}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle2">Weighting Factor:</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2" id="weightingFactorId">
            {getweightingFactor()}
          </Typography>
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
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: -1 }}
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
              <Typography>{t('sensitivityCalculatorResults.noData')}</Typography>
            </Alert>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>{pageFooter()}</DialogActions>
    </Dialog>
  );
}
