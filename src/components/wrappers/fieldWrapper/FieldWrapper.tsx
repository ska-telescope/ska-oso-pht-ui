import React from 'react';
import { Grid, Typography } from '@mui/material';

interface ShellProps {
  label?: string;
  big?: boolean;
  children?: JSX.Element | JSX.Element[];
}

const LABEL_WIDTH_XS = 3;
const CONTENT_WIDTH_XS = 12 - LABEL_WIDTH_XS;

export default function Shell({ label, big = false, children }: ShellProps) {
  const variant = big ? 'h6' : 'body2';

  return (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={LABEL_WIDTH_XS}>
        <Typography variant={variant}>
          <strong>{label}</strong>
        </Typography>
      </Grid>
      <Grid item xs={CONTENT_WIDTH_XS}>
        {children}
      </Grid>
    </Grid>
  );
}
