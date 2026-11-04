import { useId } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';

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
  value
}: SelectFieldProps) {
  // Ties the label to the select, which gives the select its accessible name
  const labelId = useId();

  const handleChange = (e: SelectChangeEvent<number>) => {
    setValue(Number(e.target.value));
  };

  return (
    <FormControl
      fullWidth
      variant="standard"
      error={!!errorText}
      required={required}
      disabled={disabled}
      // MUI's standard-variant focus state colors the shrunk label and the active underline
      // with primary.main by default - this theme's primary.main is near-white, so both go
      // invisible while focused/open. Use secondary (the theme's brand color) instead, matching
      // how @ska-telescope/ska-gui-components' own NumberEntry already works around this.
      sx={{
        '& .MuiInputLabel-root.Mui-focused': { color: 'secondary.main' },
        '& .MuiInput-underline:after': { borderBottomColor: 'secondary.main' }
      }}
    >
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <Select
        labelId={labelId}
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={onFocus}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {errorText && <FormHelperText>{errorText}</FormHelperText>}
    </FormControl>
  );
}
