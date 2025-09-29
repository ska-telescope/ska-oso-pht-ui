import React, { useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, Box } from '@mui/material';
import { useScopedTranslation } from '@services/i18n/useScopedTranslation.tsx';

type Choice = 'No Beam' | 'Multiple Beams';

interface PulsarTimingBeamFieldProps {
  setValue?: Function;
  value: String;
  valueFocus?: Function;
}

export default function PulsarTimingBeamField({
  setValue,
  value,
  valueFocus
}: PulsarTimingBeamFieldProps) {
  const FIELD = 'pulsarTimingBeam';
  const { t } = useScopedTranslation();

  const PulsarTimingBeamField = () => {
    const [selected, setSelected] = useState<Choice>('No Beam');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSelected(event.target.value as Choice);
    };
    return (
      <Box pt={1}>
        <FormControl>
          <RadioGroup
            row
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="No Beam"
            name="radio-buttons-group"
          >
            <FormControlLabel
              onFocus={valueFocus}
              value="No Beam"
              control={<Radio />}
              label={t(FIELD + '.noBeam.label')}
              toolTip={t(FIELD + '.noBeam.toolTip')}
            />
            <FormControlLabel
              onFocus={valueFocus}
              value="Multiple Beams"
              control={<Radio />}
              label={t(FIELD + '.multipleBeams.label')}
              toolTip={t(FIELD + '.multipleBeams.toolTip')}
            />
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {PulsarTimingBeamField()}
    </Box>
  );
}
