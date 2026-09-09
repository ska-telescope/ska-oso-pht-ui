import React from 'react';

// Browsers change a focused <input type="number">'s value when the mouse wheel scrolls over it,
// which is easy to trigger by accident while scrolling the page. Blurring the input during the
// wheel event's capture phase - before the browser applies that native behaviour - stops the
// value change without calling preventDefault, so the page still scrolls normally.
export function useBlurNumberInputOnWheel() {
  React.useEffect(() => {
    const blurFocusedNumberInput = () => {
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.type === 'number') {
        active.blur();
      }
    };
    document.addEventListener('wheel', blurFocusedNumberInput, { capture: true, passive: true });
    return () => document.removeEventListener('wheel', blurFocusedNumberInput, { capture: true });
  }, []);
}
