import type { JSX } from 'react';
import { Grid, Typography } from '@mui/material';

interface FieldWrapperProps {
  label?: string;
  labelWidth?: number;
  big?: boolean;
  testId?: string;
  textAlign?: string;
  children?: JSX.Element | JSX.Element[];
}

export default function FieldWrapper({
  label,
  labelWidth = 3,
  big = false,
  testId,
  textAlign = 'right',
  children
}: FieldWrapperProps) {
  const variant = big ? 'h6' : 'body2';
  const CONTENT_WIDTH_XS = 12 - labelWidth;

  return (
    <Grid
      container
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      <Grid size={{ xs: labelWidth }} sx={{ textAlign: textAlign }}>
        <Typography id={testId + 'Label'} sx={{ fontWeight: 'bold' }} variant={variant}>
          {label}
        </Typography>
      </Grid>
      <Grid size={{ xs: CONTENT_WIDTH_XS }} sx={{ textAlign: 'left' }}>
        {children}
      </Grid>
    </Grid>
  );
}
