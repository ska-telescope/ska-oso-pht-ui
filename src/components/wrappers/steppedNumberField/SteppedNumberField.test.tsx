import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SteppedNumberField from './SteppedNumberField';

// Simulates a field whose committed value is a lossy transform of what's typed (e.g. a typed
// frequency rounded to an integer channel count elsewhere, then converted back for display) -
// the same shape as the real bandwidth-in-frequency field.
function LossyRoundTripField() {
  const [channels, setChannels] = React.useState(1000);
  const displayValue = channels * 1.8; // arbitrary "resolution" - never round-trips exactly
  return (
    <SteppedNumberField
      testId="lossy"
      value={displayValue}
      format={(v) => v.toFixed(2)}
      onCommit={(raw) => setChannels(Math.round(raw / 1.8))}
      onStep={(v) => v}
    />
  );
}

const pressArrow = async (input: HTMLElement, key: 'ArrowUp' | 'ArrowDown') => {
  await userEvent.click(input);
  await userEvent.keyboard(`{${key}}`);
};

describe('<SteppedNumberField />', () => {
  test('renders the current value, formatted', () => {
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={1000}
        format={(v) => v.toFixed(1)}
        onCommit={vi.fn()}
        onStep={(v) => v}
      />
    );
    expect(screen.getByTestId('zoomChannels')).toHaveValue(1000);
  });

  test('ArrowUp/ArrowDown call onStep then onCommit with the result', async () => {
    const onCommit = vi.fn();
    const onStep = vi.fn((value: number, direction: 1 | -1) => value + direction * 10);
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={onCommit} onStep={onStep} />
    );
    const input = screen.getByTestId('zoomChannels');

    await pressArrow(input, 'ArrowUp');
    expect(onStep).toHaveBeenCalledWith(1000, 1);
    expect(onCommit).toHaveBeenCalledWith(1010);

    await pressArrow(input, 'ArrowDown');
    expect(onStep).toHaveBeenCalledWith(1000, -1);
    expect(onCommit).toHaveBeenCalledWith(990);
  });

  test('typing a valid number calls onCommit with the parsed value', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField testId="zoomChannels" value={0} onCommit={onCommit} onStep={(v) => v} />
    );

    await userEvent.type(screen.getByTestId('zoomChannels'), '5');
    expect(onCommit).toHaveBeenCalledWith(5);
  });

  test('typing an invalid value does not call onCommit', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField testId="zoomChannels" value={0} onCommit={onCommit} onStep={(v) => v} />
    );

    await userEvent.type(screen.getByTestId('zoomChannels'), '-');
    expect(onCommit).not.toHaveBeenCalled();
  });

  test('blur resets the displayed value back to the formatted prop value', async () => {
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={vi.fn()} onStep={(v) => v} />
    );
    const input = screen.getByTestId('zoomChannels');
    await userEvent.clear(input);
    await userEvent.type(input, '5');
    await userEvent.tab();
    expect(input).toHaveValue(1000);
  });

  test('a lossy round-tripped commit does not interrupt typing while still focused', async () => {
    render(<LossyRoundTripField />);
    const input = screen.getByTestId('lossy');

    await userEvent.clear(input);
    // Type a value that never round-trips exactly through the channels->display conversion.
    // Each keystroke commits a rounded-off value upstream; while focused, the field must keep
    // showing exactly what was typed rather than snapping to the rounded echo.
    await userEvent.type(input, '1234.56');
    expect(input).toHaveValue(1234.56);
  });

  test('a lossy round-tripped commit resyncs the display once the field is blurred', async () => {
    render(<LossyRoundTripField />);
    const input = screen.getByTestId('lossy');

    await userEvent.clear(input);
    await userEvent.type(input, '1234.56');
    await userEvent.tab();
    // 1234.56 / 1.8 rounds to 686 channels -> 686 * 1.8 = 1234.8
    expect(input).toHaveValue(1234.8);
  });

  test('digitsOnly strips non-digit characters as they are typed', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={0}
        digitsOnly
        onCommit={onCommit}
        onStep={(v) => v}
      />
    );

    const input = screen.getByTestId('zoomChannels');
    await userEvent.clear(input);
    await userEvent.type(input, '123');
    expect(input).toHaveValue(123);
    expect(onCommit).toHaveBeenLastCalledWith(123);
  });

  test('a native spin-button click (input event with no inputType) steps via onStep, not the raw browser value', () => {
    const onCommit = vi.fn();
    const onStep = vi.fn((v: number, direction: 1 | -1) => v + direction * 10);
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={onCommit} onStep={onStep} />
    );
    const input = screen.getByTestId('zoomChannels') as HTMLInputElement;

    // A real spin-button click has already stepped the DOM value by the native HTML `step`
    // (here, 1) before firing an `input` event with no inputType - unlike a typed/pasted edit,
    // which always sets one. That's the only signal distinguishing it from typing.
    // Goes through the native (not React-patched) value setter - assigning `input.value` directly
    // would update React's own change-tracking too, making it think nothing changed and swallow
    // the synthetic onChange entirely.
    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )!.set!;
    nativeValueSetter.call(input, '1001');
    fireEvent(input, new InputEvent('input', { bubbles: true, cancelable: true }));

    expect(onStep).toHaveBeenCalledWith(1000, 1);
    expect(onCommit).toHaveBeenCalledWith(1010);
  });

  test('ArrowUp/ArrowDown respect increment/decrement disabled bounds', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={1000}
        onCommit={onCommit}
        onStep={(v) => v}
        incrementDisabled
      />
    );

    await pressArrow(screen.getByTestId('zoomChannels'), 'ArrowUp');
    expect(onCommit).not.toHaveBeenCalled();
  });
});
