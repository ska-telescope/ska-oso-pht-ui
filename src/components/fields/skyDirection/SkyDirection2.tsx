import React from 'react';
import { useTranslation } from 'react-i18next';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box, Grid } from '@mui/material';

interface SkyDirection2FieldProps {
  labelWidth?: number;
  setValue?: Function;
  value: string;
  valueFocus?: Function;
  valueType: number;
}

export default function SkyDirection2Field({
  labelWidth = 5,
  setValue,
  value,
  valueFocus,
  valueType
}: SkyDirection2FieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'skyDirection';

  const SkyDirectionValueField = () => (
    <TextEntry
      label={t(FIELD + '.label.' + valueType)}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={labelWidth}
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
        <Grid pt={1} item xs={12}>
          {SkyDirectionValueField()}
        </Grid>
      </Grid>
    </Box>
  );
}
