import React from 'react';
import {
  Box,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

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
  onCommit: (value: number) => void;
  onFocus?: () => void;
  onStep: (value: number, direction: 1 | -1) => number;
  parse?: (raw: string) => number | null;
  required?: boolean;
  suffix?: JSX.Element;
  testId: string;
  value: number;
}

// Thin wrapper around MUI's TextField in its native type="number" form - `step`/`min`/`max` are
// plain HTML attributes
export default function SteppedNumberField({
  decrementDisabled,
  digitsOnly = false,
  disabled = false,
  errorText = '',
  format = defaultFormat,
  incrementDisabled,
  label,
  max,
  min,
  onCommit,
  onFocus,
  onStep,
  parse = defaultParse,
  required = false,
  suffix,
  testId,
  value
}: SteppedNumberFieldProps) {
  // Defaults to disabling a direction once stepping it is a genuine no-op, per onStep itself -
  // not a static value-vs-min/max comparison, which would wrongly disable stepping when value is
  // already *past* max (a real, reachable state here since typing is never clamped, only
  // flagged) even though stepping in either direction is exactly what corrects it back in range.
  const steppedUp = onStep(value, 1);
  const steppedDown = onStep(value, -1);
  const effectiveIncrementDisabled =
    incrementDisabled ?? (steppedUp === value || value >= (max ?? Infinity));
  const effectiveDecrementDisabled =
    decrementDisabled ?? (steppedDown === value || value <= (min ?? -Infinity));
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
    onCommit(value);
  };

  // Shared by the keyboard handler and the custom spin buttons below, so both step through
  // exactly the same snap/clamp/commit path rather than one of them falling back to native
  // behaviour.
  const doStep = (direction: 1 | -1) => {
    if (direction === 1 ? effectiveIncrementDisabled : effectiveDecrementDisabled) {
      // Stepping is blocked at this bound, but the displayed text can still be stale from typing
      // (an over-max value that already got clamped upstream, e.g. incrementDisabled itself just
      // flipped true off the back of that clamp) - resync it to the real committed value rather
      // than leaving the step look like a no-op.
      let clamped = value;
      if (max !== undefined && clamped > max) {
        clamped = max;
      }
      if (min !== undefined && clamped < min) {
        clamped = min;
      }
      onCommit(clamped);
      setInputValue(format(clamped));
      return;
    }
    const stepped = onStep(value, direction);
    // A step is an authoritative new value (not a mid-typing keystroke), so it must update the
    // displayed text immediately - the resync effect above only fires while unfocused, and the
    // field is still focused for both a keyboard step and a spin-button click.
    setInputValue(format(stepped));
    onCommit(stepped);
  };

  // Owns ArrowUp/ArrowDown itself rather than letting the browser step the raw value by the
  // `step` attribute - `onStep` may snap to a non-uniform legal grid the HTML step can't express.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    doStep(e.key === 'ArrowUp' ? 1 : -1);
  };

  // Prevents the button click from stealing focus away from the input first (which would fire
  // handleBlur and interrupt the step)
  const preventBlur = (e: React.MouseEvent) => e.preventDefault();

  // doStep closes over the current value/effectiveDisabled on every render; the hold-to-repeat
  // interval below is set up once per press and would otherwise keep calling the stale closure
  // from the moment the press started, repeatedly stepping from the same original value instead
  // of progressing. Echoed into a ref on every render (same pattern as formatRef above) so the
  // interval always calls the current one.
  const doStepRef = React.useRef(doStep);
  doStepRef.current = doStep;
  const holdTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const holdIntervalRef = React.useRef<ReturnType<typeof setInterval>>();
  const didAutoRepeatRef = React.useRef(false);

  const stopHold = () => {
    clearTimeout(holdTimeoutRef.current);
    clearInterval(holdIntervalRef.current);
  };
  React.useEffect(() => stopHold, []);

  // Mirrors the native number-input spinner's press-and-hold-to-repeat behaviour, which the
  // custom buttons don't get for free from the browser. A plain click still steps once via
  // handleSpinButtonClick below; holding past the initial delay switches to repeating on an
  // interval, and suppresses the single extra step handleSpinButtonClick would otherwise add
  // when the eventual mouseup's click event fires.
  const startHold = (direction: 1 | -1) => {
    stopHold();
    didAutoRepeatRef.current = false;
    holdTimeoutRef.current = setTimeout(() => {
      didAutoRepeatRef.current = true;
      doStepRef.current(direction);
      holdIntervalRef.current = setInterval(() => doStepRef.current(direction), 75);
    }, 450);
  };

  const handleSpinButtonMouseDown = (e: React.MouseEvent, direction: 1 | -1) => {
    preventBlur(e);
    startHold(direction);
  };

  const handleSpinButtonClick = (direction: 1 | -1) => {
    // The hold-to-repeat path already stepped (possibly several times) - the click that fires on
    // release is not a separate, additional step.
    if (didAutoRepeatRef.current) {
      didAutoRepeatRef.current = false;
      return;
    }
    doStep(direction);
  };

  const spinButtons = (
    <Stack
      sx={{
        mr: suffix ? 0.5 : 0
      }}
    >
      <IconButton
        aria-label="increment"
        data-testid={`${testId}Increment`}
        disabled={disabled || effectiveIncrementDisabled}
        onClick={() => handleSpinButtonClick(1)}
        onMouseDown={(e) => handleSpinButtonMouseDown(e, 1)}
        onMouseLeave={stopHold}
        onMouseUp={stopHold}
        sx={{ borderRadius: 0, height: '0.9rem', p: 0 }}
        tabIndex={-1}
      >
        <KeyboardArrowUpIcon sx={{ fontSize: '0.9rem' }} />
      </IconButton>
      <IconButton
        aria-label="decrement"
        data-testid={`${testId}Decrement`}
        disabled={disabled || effectiveDecrementDisabled}
        onClick={() => handleSpinButtonClick(-1)}
        onMouseDown={(e) => handleSpinButtonMouseDown(e, -1)}
        onMouseLeave={stopHold}
        onMouseUp={stopHold}
        sx={{ borderRadius: 0, height: '0.9rem', p: 0 }}
        tabIndex={-1}
      >
        <KeyboardArrowDownIcon sx={{ fontSize: '0.9rem' }} />
      </IconButton>
    </Stack>
  );

  // Replaces the native stepMismatch popup (which isn't flexible enough to show the nearest valid values)
  const validityHint = errorText
    ? `Nearest valid values: ${format(steppedDown)} and ${format(steppedUp)} - please use arrows to step to a valid value`
    : '';

  return (
    <Box>
      <Tooltip title={validityHint} arrow placement="bottom">
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
          // Custom styling to match the rest of the app and hide the spin buttons
          sx={{
            '& .MuiInputLabel-root.Mui-focused': { color: 'secondary.main' },
            '& .MuiInput-underline:after': { borderBottomColor: 'secondary.main' },
            // custom spin buttons are used instead of the native ones, so hide the native ones
            '& input[type=number]': { MozAppearance: 'textfield' },
            '& input[type=number]::-webkit-outer-spin-button': {
              WebkitAppearance: 'none',
              margin: 0
            },
            '& input[type=number]::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0
            }
          }}
          slotProps={{
            htmlInput: { 'data-testid': testId, min, max, step: 'any' },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  {spinButtons}
                  {suffix}
                </InputAdornment>
              )
            }
          }}
          value={inputValue}
        />
      </Tooltip>
      {errorText && <FormHelperText error>{errorText}</FormHelperText>}
    </Box>
  );
}
