import React from 'react';

// State that reverts to restingValue after delayMs, unless changed again first.
export function useAutoClearingState<T>(restingValue: T, delayMs: number) {
  const [value, setValue] = React.useState(restingValue);

  React.useEffect(() => {
    if (value === restingValue) return;
    const timerId = setTimeout(() => setValue(restingValue), delayMs);
    return () => clearTimeout(timerId);
  }, [value, restingValue, delayMs]);

  return [value, setValue] as const;
}
