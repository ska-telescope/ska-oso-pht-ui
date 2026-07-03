import { HTMLAttributes } from 'react';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

export interface SelectFieldOption {
  label: string;
  value: number;
}

interface SelectFieldProps {
  disabled?: boolean;
  errorText?: string;
  label?: string;
  onFocus?: () => void;
  options: SelectFieldOption[];
  required?: boolean;
  setValue: (value: number) => void;
  testId: string;
  value: number;
}

// Thin wrapper around MUI's Select. Unlike @ska-telescope/ska-gui-components' DropDown, MUI
// opens the menu on a click anywhere in the display box, not just the arrow icon.
export default function SelectField({
  disabled = false,
  errorText = '',
  label,
  onFocus,
  options,
  required = false,
  setValue,
  testId,
  value
}: SelectFieldProps) {
  const labelId = `${testId}Label`;
  const selectDisplayProps = { 'data-testid': testId } as unknown as HTMLAttributes<HTMLDivElement>;

  const handleChange = (e: SelectChangeEvent<number>) => {
    setValue(Number(e.target.value));
  };

  return (
    <FormControl fullWidth variant="standard" error={!!errorText} required={required} disabled={disabled}>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
        SelectDisplayProps={selectDisplayProps}
      >
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
}
