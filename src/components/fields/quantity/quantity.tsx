import { Box, FormHelperText, TextField } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import type { ComponentProps } from 'react';
import { useNumericInput } from '@/utils/hooks/useNumericInput';

type DropDownProps = ComponentProps<typeof DropDown>;

interface QuantityFieldProps {
  value: number;
  setValue: (value: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  minValue?: number;
  maxValue?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  step?: number;
  requiredMessage: string;
  rangeMessage: string;
  validate?: (value: number) => string;
  onFocus?: () => void;
  onUnitsFocus?: () => void;
  units?: number;
  setUnits?: (unit: number) => void;
  unitOptions?: DropDownProps['options'];
  unitsTestId?: string;
}

export default function QuantityField({
  value,
  setValue,
  label = '',
  required = true,
  disabled = false,
  minValue,
  maxValue,
  minInclusive = true,
  maxInclusive = true,
  step,
  requiredMessage,
  rangeMessage,
  validate,
  onFocus = undefined,
  onUnitsFocus = undefined,
  units,
  setUnits,
  unitOptions,
  unitsTestId
}: QuantityFieldProps) {
  const { text, error, handleChange } = useNumericInput(value, setValue, {
    requiredMessage: requiredMessage,
    rangeMessage: rangeMessage,
    minValue: validate ? undefined : minValue,
    maxValue: validate ? undefined : maxValue,
    minInclusive: validate ? true : minInclusive,
    maxInclusive: validate ? true : maxInclusive,
    validate
  });

  return (
    <Box pt={2}>
      <Box display="flex" alignItems="flex-end" gap={1}>
        <TextField
          variant="standard"
          type="number"
          fullWidth
          label={label}
          value={text}
          error={!!error}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={onFocus}
          slotProps={{
            htmlInput: {
              min: minValue,
              max: maxValue,
              step: step
            }
          }}
          required={required}
        />
        <Box>
          <DropDown
            options={unitOptions}
            testId={unitsTestId}
            value={units}
            disabled={disabled}
            setValue={setUnits}
            label={label}
            onFocus={onUnitsFocus}
            InputProps={{ disableUnderline: true }}
          />
        </Box>
      </Box>
      <FormHelperText error={!!error}>{error || ' '}</FormHelperText>
    </Box>
  );
}
