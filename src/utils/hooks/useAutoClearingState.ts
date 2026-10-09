import React from 'react';

// State that reverts to restingValue after delayMs, unless changed again first.
// Timer is managed in the setter itself, not via useEffect on value - React bails
// out of re-rendering (and so the effect) when set to an already-equal value, which
// would otherwise leave a repeated non-resting value on its original, stale timer.
export function useAutoClearingState<T>(restingValue: T, delayMs: number) {
  const [value, setValue] = React.useState(restingValue);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const setAutoClearingValue = React.useCallback(
    (next: T) => {
      clearTimeout(timerRef.current);
      setValue(next);
      if (next !== restingValue) {
        timerRef.current = setTimeout(() => setValue(restingValue), delayMs);
      }
    },
    [restingValue, delayMs]
  );

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  return [value, setAutoClearingValue] as const;
}
