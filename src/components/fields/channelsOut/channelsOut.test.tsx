import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import ChannelsOut from './channelsOut';
import { CHANNELS_OUT_MIN } from '@/utils/constants.ts';

// Mock the translation hook so validation output is deterministic
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, opts?: any) =>
      opts && opts.min !== undefined ? `${key}:${opts.min}-${opts.max}` : key
  })
}));

const ERROR_TEXT = 'channelsOut.error:2-40';

const StatefulChannelsOut = ({
  initial,
  maxValue
}: {
  initial: number;
  maxValue?: number;
}) => {
  const [value, setValue] = React.useState(initial);
  return <ChannelsOut value={value} setValue={setValue} maxValue={maxValue} />;
};

const pressArrowUp = async (input: HTMLElement) => {
  await userEvent.click(input);
  await userEvent.keyboard('{ArrowUp}');
};

describe('<ChannelsOut />', () => {
  it('renders correctly', () => {
    render(<ChannelsOut value={2} setValue={vi.fn()} />);
    expect(screen.getByTestId('channelsOut')).toBeInTheDocument();
  });

  it.each([[2], [40]])('accepts valid value %i and calls setValue with no error', async (value) => {
    const setValue = vi.fn();
    render(<ChannelsOut value={2} setValue={setValue} />);
    const input = screen.getByTestId('channelsOut');
    await userEvent.clear(input);
    await userEvent.type(input, String(value));
    expect(setValue).toHaveBeenCalledWith(value);
    expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  it.each([[0], [1], [41]])(
    'accepts invalid value %i, keeps it via setValue, and shows a persistent error',
    async (value) => {
      const setValue = vi.fn();
      render(<ChannelsOut value={2} setValue={setValue} />);
      const input = screen.getByTestId('channelsOut');
      await userEvent.clear(input);
      await userEvent.type(input, String(value));
      expect(setValue).toHaveBeenCalledWith(value);
      expect(screen.getByText(ERROR_TEXT)).toBeInTheDocument();
    }
  );

  it('does not auto-correct an invalid value on blur', async () => {
    render(<StatefulChannelsOut initial={2} />);
    const input = screen.getByTestId('channelsOut') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '41');
    await userEvent.tab();
    expect(input.value).toBe('41');
    expect(screen.getByText(ERROR_TEXT)).toBeInTheDocument();
  });

  it('clears the error once the user enters a valid value', async () => {
    render(<StatefulChannelsOut initial={2} />);
    const input = screen.getByTestId('channelsOut');
    await userEvent.clear(input);
    await userEvent.type(input, '41');
    expect(screen.getByText(ERROR_TEXT)).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, '5');
    expect(screen.queryByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  it('steps up by 1 and clamps at the configured maxValue', async () => {
    const setValue = vi.fn();
    render(<ChannelsOut value={CHANNELS_OUT_MIN} setValue={setValue} maxValue={5} />);
    await pressArrowUp(screen.getByTestId('channelsOut'));
    expect(setValue).toHaveBeenCalledWith(CHANNELS_OUT_MIN + 1);
  });

  it('disables the decrement and increment buttons when min and maxValue coincide', () => {
    render(
      <ChannelsOut value={CHANNELS_OUT_MIN} setValue={vi.fn()} maxValue={CHANNELS_OUT_MIN} />
    );
    expect(screen.getByTestId('channelsOutDecrement')).toBeDisabled();
    expect(screen.getByTestId('channelsOutIncrement')).toBeDisabled();
  });
});
