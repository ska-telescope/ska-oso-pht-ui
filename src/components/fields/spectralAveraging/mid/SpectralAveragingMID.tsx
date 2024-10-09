import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { Grid } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION, OBSERVATION } from '../../../../utils/constants';

interface SpectralAveragingMIDFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}

export default function SpectralAveragingMIDField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: SpectralAveragingMIDFieldProps) {
  const { t } = useTranslation('pht');
  const { helpComponent } = storageObject.useStore();
  const FIELD = 'spectralAveraging';

  const getOptions = () => OBSERVATION.SpectralAveraging;

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - widthButton : 12}>
        <DropDown
          disabled={disabled}
          options={getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={() => helpComponent(t(FIELD + '.help'))}
          required={required}
        />
      </Grid>
      <Grid item xs={suffix ? widthButton : 0}>
        {suffix}
      </Grid>
    </Grid>
  );
}
