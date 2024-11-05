import React from 'react';
import { Grid } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { LAB_IS_BOLD, LAB_POSITION, OBSERVATION } from '../../../utils/constants';

interface BandwidthFieldProps {
  disabled?: boolean;
  label?: string;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  testId: string;
  telescope: number;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function BandwidthField({
  disabled = false,
  label = '',
  onFocus = null,
  required = false,
  setValue = null,
  suffix = null,
  value,
  telescope,
  testId,
  widthButton,
  widthLabel = 5
}: BandwidthFieldProps) {
  const isLow = () => telescope === 1;

  const getOptions = () => {
    return OBSERVATION.array[telescope - 1].bandWidth;
  };
  const roundBandwidthValue = options =>
    options.map(obj => {
      return {
        label: `${parseFloat(obj.label).toFixed(1)} ${obj.label.split(' ')[1]}`,
        value: obj.value,
        mapping: obj.mapping
      };
    });

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - widthButton : 12}>
        <DropDown
          disabled={disabled}
          options={isLow() ? roundBandwidthValue(getOptions()) : getOptions()}
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
      <Grid item xs={suffix ? widthButton : 0}>
        {suffix}
      </Grid>
    </Grid>
  );
}
