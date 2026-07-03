import React from 'react';
import { Box, FormHelperText, IconButton, InputAdornment, TextField } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const defaultFormat = (value: number): string => String(value);
const defaultParse = (raw: string): number | null =>
  raw === '' || isNaN(Number(raw)) ? null : Number(raw);

interface SteppedNumberFieldProps {
  decrementDisabled?: boolean;
  disabled?: boolean;
  errorText?: string;
  format?: (value: number) => string;
  incrementDisabled?: boolean;
  label?: string;
  onCommit: (value: number) => void;
  onFocus?: () => void;
  onStep: (value: number, direction: 1 | -1) => number;
  parse?: (raw: string) => number | null;
  required?: boolean;
  suffix?: JSX.Element;
  testId: string;
  value: number;
}

// Thin wrapper around MUI's TextField with step arrows. Unlike @ska-telescope/ska-gui-components'
// NumberEntry, this owns the display/typed-value mirroring and step dispatch itself - callers only
// supply the two things that actually differ per field: how to turn a typed number into a
// committed value (`onCommit`, e.g. range-checked or converted into some other underlying state),
// and how to compute the next value for a single step (`onStep`, e.g. snap-to-legal-value).
export default function SteppedNumberField({
  decrementDisabled = false,
  disabled = false,
  errorText = '',
  format = defaultFormat,
  incrementDisabled = false,
  label,
  onCommit,
  onFocus,
  onStep,
  parse = defaultParse,
  required = false,
  suffix,
  testId,
  value
}: SteppedNumberFieldProps) {
  const [inputValue, setInputValue] = React.useState(format(value));
  // Tracks whether the input is currently focused. When a commit round-trips through a lossy
  // transform (e.g. a typed frequency gets rounded to an integer channel count elsewhere and the
  // displayed value is recomputed from that), the value prop echoed back rarely matches exactly
  // what's mid-typing - resyncing from it on every keystroke would otherwise interrupt typing.
  const isFocused = React.useRef(false);

  React.useEffect(() => {
    if (!isFocused.current) {
      setInputValue(format(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (raw: string) => {
    setInputValue(raw);
    const parsed = parse(raw);
    if (parsed !== null) {
      onCommit(parsed);
    }
  };

  const handleFocus = () => {
    isFocused.current = true;
    onFocus?.();
  };

  const handleBlur = () => {
    isFocused.current = false;
    setInputValue(format(value));
  };

  const step = (direction: 1 | -1) => onCommit(onStep(value, direction));

  return (
    <Box>
      <TextField
        fullWidth
        variant="standard"
        disabled={disabled}
        error={!!errorText}
        label={label}
        onBlur={handleBlur}
        onChange={e => handleChange(e.target.value)}
        onFocus={handleFocus}
        required={required}
        slotProps={{
          htmlInput: { 'data-testid': testId },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={`${testId}-increment`}
                  disabled={disabled || incrementDisabled}
                  onClick={() => step(1)}
                  size="small"
                >
                  <KeyboardArrowUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label={`${testId}-decrement`}
                  disabled={disabled || decrementDisabled}
                  onClick={() => step(-1)}
                  size="small"
                >
                  <KeyboardArrowDownIcon fontSize="small" />
                </IconButton>
                {suffix}
              </InputAdornment>
            )
          }
        }}
        value={inputValue}
      />
      {errorText && <FormHelperText error>{errorText}</FormHelperText>}
    </Box>
  );
}
