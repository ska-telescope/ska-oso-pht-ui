import React from 'react';
import { Grid, Typography } from '@mui/material';

interface FieldWrapperProps {
  label?: string;
  labelWidth?: number;
  big?: boolean;
  testId?: string;
  children?: JSX.Element | JSX.Element[];
}

export default function FieldWrapper({
  label,
  labelWidth = 3,
  big = false,
  testId,
  children
}: FieldWrapperProps) {
  const variant = big ? 'h6' : 'body2';
  const CONTENT_WIDTH_XS = 12 - labelWidth;

  return (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={labelWidth}>
        <Typography id={testId + 'Label'} sx={{ fontWeight: 'bold' }} variant={variant}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={CONTENT_WIDTH_XS}>
        {children}
      </Grid>
    </Grid>
  );
}
