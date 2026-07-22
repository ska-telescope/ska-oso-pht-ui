import React from 'react';
import { Box, FormHelperText, InputAdornment, TextField } from '@mui/material';

const defaultFormat = (value: number): string => String(value);
const defaultParse = (raw: string): number | null =>
  raw === '' || isNaN(Number(raw)) ? null : Number(raw);

interface SteppedNumberFieldProps {
  decrementDisabled?: boolean;
  digitsOnly?: boolean;
  disabled?: boolean;
  errorText?: string;
  format?: (value: number) => string;
  incrementDisabled?: boolean;
  label?: string;
  max?: number;
  min?: number;
  onBlurCommit?: (value: number) => void;
  onCommit: (value: number) => void;
  onFocus?: () => void;
  onStep: (value: number, direction: 1 | -1) => number;
  parse?: (raw: string) => number | null;
  required?: boolean;
  step?: number;
  suffix?: JSX.Element;
  testId: string;
  value: number;
}

// Thin wrapper around MUI's TextField in its native type="number" form - the browser supplies the
// up/down spinner, `step`/`min`/`max` are plain HTML attributes as they'd be on any number input.
// ArrowUp/ArrowDown are intercepted directly (rather than inferred after the fact from the
// resulting value, as a diff-based heuristic would) so they call the field's own snap-to-legal-
// value logic (`onStep`) instead of the browser's fixed arithmetic step. A native spin-button
// mouse click isn't distinguished from typing this way (an inputType-based check was tried and
// reverted - it isn't reliably set for every real typing path, which silently corrupted genuinely
// typed values) - it falls through to the browser's own raw stepped value like any other edit.
export default function SteppedNumberField({
  decrementDisabled = false,
  digitsOnly = false,
  disabled = false,
  errorText = '',
  format = defaultFormat,
  incrementDisabled = false,
  label,
  max,
  min,
  onBlurCommit,
  onCommit,
  onFocus,
  onStep,
  parse = defaultParse,
  required = false,
  step,
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
  const formatRef = React.useRef(format);
  formatRef.current = format;

  React.useEffect(() => {
    if (!isFocused.current) {
      setInputValue(formatRef.current(value));
    }
  }, [value]);

  const handleChange = (raw: string) => {
    const sanitized = digitsOnly ? raw.replace(/[^0-9]/g, '') : raw;
    setInputValue(sanitized);
    const parsed = parse(sanitized);
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
    onBlurCommit?.(value);
  };

  // Owns ArrowUp/ArrowDown itself rather than letting the browser step the raw value by the
  // `step` attribute - `onStep` may snap to a non-uniform legal grid the HTML step can't express.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const direction = e.key === 'ArrowUp' ? 1 : -1;
    if (direction === 1 ? incrementDisabled : decrementDisabled) return;
    onCommit(onStep(value, direction));
  };

  return (
    <Box>
      <TextField
        fullWidth
        type="number"
        variant="standard"
        disabled={disabled}
        error={!!errorText}
        label={label}
        onBlur={handleBlur}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        required={required}
        // MUI's standard-variant focus state colors the shrunk label and the active underline
        // with primary.main by default - this theme's primary.main is near-white, so both go
        // invisible while focused. Use secondary (the theme's brand color) instead, matching
        // how @ska-telescope/ska-gui-components' own NumberEntry already works around this.
        sx={{
          '& .MuiInputLabel-root.Mui-focused': { color: 'secondary.main' },
          '& .MuiInput-underline:after': { borderBottomColor: 'secondary.main' }
        }}
        slotProps={{
          htmlInput: { 'data-testid': testId, min, max, step },
          input: suffix
            ? { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> }
            : undefined
        }}
        value={inputValue}
      />
      {errorText && <FormHelperText error>{errorText}</FormHelperText>}
    </Box>
  );
}
