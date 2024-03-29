import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box, Grid } from '@mui/material';

interface VelocityFieldProps {
  labelWidth?: number;
  setValue?: Function;
  setValueType?: Function;
  setValueUnit?: Function;
  value: string;
  valueFocus?: Function;
  valueType: number;
  valueTypeFocus?: Function;
  valueUnit: number;
  valueUnitFocus?: Function;
  required?: boolean;
}

export default function VelocityField({
  labelWidth = 5,
  setValue,
  setValueType,
  setValueUnit,
  value,
  valueFocus,
  valueType,
  valueTypeFocus,
  valueUnit,
  valueUnitFocus
}: VelocityFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'velocity';

  const VelocityTypeField = () => {
    const OPTIONS = [0, 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t(FIELD + '.' + e), value: e }));
    };

    return (
      <Box pt={1} pr={1}>
        <DropDown
          options={getOptions()}
          testId={FIELD + 'Type'}
          value={valueType}
          setValue={setValueType}
          label=""
          onFocus={valueTypeFocus}
          required
        />
      </Box>
    );
  };

  const VelocityValueField = () => {
    return (
      <TextEntry
        label=""
        testId={FIELD + 'Value'}
        value={value}
        setValue={setValue}
        suffix={valueType === 0 ? VelocityUnitField() : ''}
        onFocus={valueFocus}
        required
      />
    );
  };

  const VelocityUnitField = () => {
    const OPTIONS = [0, 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t(FIELD + '.units.' + e), value: e }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId={FIELD + 'Type'}
        value={valueUnit}
        setValue={setValueUnit}
        label=""
        onFocus={valueUnitFocus}
      />
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      <Grid
        spacing={0}
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid item xs={labelWidth}>
          {VelocityTypeField()}
        </Grid>
        <Grid item xs={12 - labelWidth}>
          {VelocityValueField()}
        </Grid>
      </Grid>
    </Box>
  );
}
