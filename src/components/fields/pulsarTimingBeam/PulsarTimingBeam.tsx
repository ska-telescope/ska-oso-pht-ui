import React from 'react';
import { Radio, FormControlLabel } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

export default function PulsarTimingBeamField() {
  const { t } = useScopedTranslation();
  const [selectedValue, setSelectedValue] = React.useState('noBeam');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    name: 'color-radio-button-demo',
    inputProps: { 'aria-label': item }
  });

  return (
    <div>
      <FormControlLabel
        control={<Radio {...controlProps('noBeam')} color="default" />}
        label={t('pulsarTimingBeam.noBeam.label')}
        data-testid="No BeamTestId"
      />
      <FormControlLabel
        control={<Radio {...controlProps('multipleBeams')} color="default" />}
        label={t('pulsarTimingBeam.multipleBeams.label')}
        data-testid="Multiple BeamsTestId"
      />
    </div>
  );
}
