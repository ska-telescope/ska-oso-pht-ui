import * as React from 'react';
import { Grid, Typography } from '@mui/material';
import { Alert, AlertColorTypes, StatusIcon } from '@ska-telescope/ska-gui-components';

interface StandardAlertProps {
  color: AlertColorTypes;
  testId: string;
  text: string;
}

const FONTSIZE = 25;

export default function StandardAlert({ color, testId, text }: StandardAlertProps) {
  function getLevel(color: AlertColorTypes): number {
    switch (color) {
      case AlertColorTypes.Success:
        return 0;
      case AlertColorTypes.Error:
        return 1;
      case AlertColorTypes.Warning:
        return 2;
      case AlertColorTypes.Info:
      default:
        return 4;
    }
  }

  return (
    <Alert color={color} testId={testId}>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <StatusIcon icon level={getLevel(color)} size={FONTSIZE} testId={testId + 'Icon'} />
        </Grid>
        <Grid item>
          <Typography>{text}</Typography>
        </Grid>
        <Grid item></Grid>
      </Grid>
    </Alert>
  );
}
