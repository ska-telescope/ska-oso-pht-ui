import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SteppedNumberField from './SteppedNumberField';

describe('<SteppedNumberField />', () => {
  test('renders the current value, formatted', () => {
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={1000}
        format={v => `${v}!`}
        onCommit={vi.fn()}
        onStep={v => v}
      />
    );
    expect(screen.getByTestId('zoomChannels')).toHaveValue('1000!');
  });

  test('increment/decrement arrows call onStep then onCommit with the result', async () => {
    const onCommit = vi.fn();
    const onStep = vi.fn((value: number, direction: 1 | -1) => value + direction * 10);
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={onCommit} onStep={onStep} />
    );

    await userEvent.click(screen.getByLabelText('zoomChannels-increment'));
    expect(onStep).toHaveBeenCalledWith(1000, 1);
    expect(onCommit).toHaveBeenCalledWith(1010);

    await userEvent.click(screen.getByLabelText('zoomChannels-decrement'));
    expect(onStep).toHaveBeenCalledWith(1000, -1);
    expect(onCommit).toHaveBeenCalledWith(990);
  });

  test('typing a valid number calls onCommit with the parsed value', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField testId="zoomChannels" value={0} onCommit={onCommit} onStep={v => v} />
    );

    await userEvent.type(screen.getByTestId('zoomChannels'), '5');
    expect(onCommit).toHaveBeenCalledWith(5);
  });

  test('typing an invalid value does not call onCommit', async () => {
    const onCommit = vi.fn();
    render(
      <SteppedNumberField testId="zoomChannels" value={0} onCommit={onCommit} onStep={v => v} />
    );

    await userEvent.type(screen.getByTestId('zoomChannels'), '-');
    expect(onCommit).not.toHaveBeenCalled();
  });

  test('blur resets the displayed value back to the formatted prop value', async () => {
    render(
      <SteppedNumberField testId="zoomChannels" value={1000} onCommit={vi.fn()} onStep={v => v} />
    );
    const input = screen.getByTestId('zoomChannels');
    await userEvent.clear(input);
    await userEvent.type(input, '5');
    await userEvent.tab();
    expect(input).toHaveValue('1000');
  });

  test('arrows respect increment/decrement disabled bounds', () => {
    render(
      <SteppedNumberField
        testId="zoomChannels"
        value={1000}
        onCommit={vi.fn()}
        onStep={v => v}
        incrementDisabled
      />
    );
    expect(screen.getByLabelText('zoomChannels-increment')).toBeDisabled();
  });
});
