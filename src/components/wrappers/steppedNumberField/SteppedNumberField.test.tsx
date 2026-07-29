import React from 'react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  test('ArrowUp/ArrowDown update the displayed value immediately, even while still focused', async () => {
    // Models onStep clamping an out-of-range typed value (e.g. back down to a max bound) - the
    // field stays focused after an arrow press, so this checks the display isn't stuck showing
    // the stale typed value while waiting for a blur that may never come.
    const onStep = vi.fn((_value: number, direction: 1 | -1) => (direction === 1 ? 500 : -500));
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={vi.fn()} onStep={onStep} />
    );
    const input = screen.getByTestId('zoomChannels');

    await pressArrow(input, 'ArrowUp');
    expect(input).toHaveValue(500);
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

  test('ArrowUp resyncs a stale typed value to the prop value when already at the incrementDisabled bound', async () => {
    // Models typing a channel count above the max: the parent clamps and commits it to max
    // upstream (flipping incrementDisabled true) but the field's own display, focused mid-typing,
    // is still showing the raw typed number until this arrow press.
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={100}
        onCommit={vi.fn()}
        onStep={(v) => v}
        incrementDisabled
      />
    );
    const input = screen.getByTestId('zoomChannels');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveValue(100);
  });

  test('the spin buttons are visible regardless of focus', async () => {
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={vi.fn()} onStep={(v) => v} />
    );
    const increment = screen.getByTestId('zoomChannelsIncrement');
    expect(increment).toBeVisible();

    await userEvent.click(screen.getByTestId('zoomChannels'));
    expect(increment).toBeVisible();

    await userEvent.tab();
    expect(increment).toBeVisible();
  });

  test('clicking the custom spin buttons calls onStep then onCommit with the result, same as the arrow keys', async () => {
    const onCommit = vi.fn();
    const onStep = vi.fn((value: number, direction: 1 | -1) => value + direction * 10);
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={onCommit} onStep={onStep} />
    );
    await userEvent.click(screen.getByTestId('zoomChannels'));

    await userEvent.click(screen.getByTestId('zoomChannelsIncrement'));
    expect(onStep).toHaveBeenCalledWith(1000, 1);
    expect(onCommit).toHaveBeenCalledWith(1010);

    await userEvent.click(screen.getByTestId('zoomChannelsDecrement'));
    expect(onStep).toHaveBeenCalledWith(1000, -1);
    expect(onCommit).toHaveBeenCalledWith(990);
  });

  describe('press-and-hold on a spin button', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    test('a quick click steps exactly once', () => {
      const onCommit = vi.fn();
      render(
        <SteppedNumberField
          testId="zoomChannels"
          value={1000}
          onCommit={onCommit}
          onStep={(v, d) => v + d}
        />
      );
      const increment = screen.getByTestId('zoomChannelsIncrement');

      fireEvent.mouseDown(increment);
      fireEvent.mouseUp(increment);
      fireEvent.click(increment);

      expect(onCommit).toHaveBeenCalledTimes(1);
      expect(onCommit).toHaveBeenCalledWith(1001);
    });

    test('holding past the initial delay repeats the step, and releasing stops it without an extra step', () => {
      vi.useFakeTimers();
      const onCommit = vi.fn();
      render(
        <SteppedNumberField
          testId="zoomChannels"
          value={1000}
          onCommit={onCommit}
          onStep={(v, d) => v + d}
        />
      );
      const increment = screen.getByTestId('zoomChannelsIncrement');

      fireEvent.mouseDown(increment);
      expect(onCommit).not.toHaveBeenCalled(); // not yet past the initial hold delay

      act(() => {
        vi.advanceTimersByTime(450);
      });
      expect(onCommit).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(75 * 3);
      });
      expect(onCommit).toHaveBeenCalledTimes(4);

      fireEvent.mouseUp(increment);
      fireEvent.click(increment); // the click the browser fires on release of a mousedown+mouseup
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onCommit).toHaveBeenCalledTimes(4); // no extra step from the release, no more repeats
    });

    test('moving the pointer off the button while held stops the repeat, same as releasing it', () => {
      vi.useFakeTimers();
      const onCommit = vi.fn();
      render(
        <SteppedNumberField
          testId="zoomChannels"
          value={1000}
          onCommit={onCommit}
          onStep={(v, d) => v + d}
        />
      );
      const increment = screen.getByTestId('zoomChannelsIncrement');

      fireEvent.mouseDown(increment);
      act(() => {
        vi.advanceTimersByTime(450);
      });
      expect(onCommit).toHaveBeenCalledTimes(1);

      fireEvent.mouseLeave(increment);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(onCommit).toHaveBeenCalledTimes(1);
    });
  });

  test('the increment/decrement spin buttons default to disabling once onStep would be a no-op, with no explicit prop', () => {
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={100}
        onCommit={vi.fn()}
        onStep={(v, d) => Math.min(100, Math.max(0, v + d))}
      />
    );

    expect(screen.getByTestId('zoomChannelsIncrement')).toBeDisabled();
    expect(screen.getByTestId('zoomChannelsDecrement')).not.toBeDisabled();
  });

  test('the default does not disable stepping just because value already sits past max - onStep is still expected to correct it', () => {
    // Mirrors central frequency's "always accept the typed value, flag error" design: value can
    // legitimately sit outside [min, max] as an error state, and onStep is relied on to clamp it
    // back in - a naive value >= max default would wrongly disable exactly the step that fixes it.
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={105}
        onCommit={vi.fn()}
        onStep={(v, d) => Math.min(100, Math.max(0, v + d))}
      />
    );

    expect(screen.getByTestId('zoomChannelsIncrement')).not.toBeDisabled();
    expect(screen.getByTestId('zoomChannelsDecrement')).not.toBeDisabled();
  });

  test('an explicit incrementDisabled/decrementDisabled prop overrides the value/min/max default', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={1000}
        onCommit={onCommit}
        onStep={(v) => v}
        incrementDisabled
        decrementDisabled
      />
    );

    expect(screen.getByTestId('zoomChannelsIncrement')).toBeDisabled();
    expect(screen.getByTestId('zoomChannelsDecrement')).toBeDisabled();
  });
});
