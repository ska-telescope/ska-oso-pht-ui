import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box, Grid } from '@mui/material';

interface SkyDirection1FieldProps {
  labelWidth?: number;
  setValue?: Function;
  setValueType?: Function;
  value: string;
  valueFocus?: Function;
  valueType: number;
  valueTypeFocus?: Function;
}

export default function SkyDirection1Field({
  labelWidth = 5,
  setValue,
  setValueType,
  value,
  valueFocus,
  valueType,
  valueTypeFocus
}: SkyDirection1FieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'skyDirection';

  const SkyDirectionTypeField = () => {
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
        />
      </Box>
    );
  };

  const SkyDirectionValueField = () => (
    <TextEntry
      label=""
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
    />
  );

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
          {SkyDirectionTypeField()}
        </Grid>
        <Grid item xs={12 - labelWidth}>
          {SkyDirectionValueField()}
        </Grid>
      </Grid>
    </Box>
  );
}
