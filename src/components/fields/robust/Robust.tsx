import React from 'react';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { LAB_IS_BOLD, LAB_POSITION, ROBUST } from '../../../utils/constants';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  label: string;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  testId: string;
  value: string | number;
  widthButton?: number;
  widthLabel?: number;
}

export default function RobustField({
  disabled = false,
  onFocus = null,
  label,
  required = false,
  setValue = null,
  suffix = null,
  testId,
  value,
  widthButton = 0,
  widthLabel = 4
}: RobustFieldProps) {
  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={ROBUST}
          testId={testId}
          value={value}
          setValue={setValue}
          label={label}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={onFocus}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
