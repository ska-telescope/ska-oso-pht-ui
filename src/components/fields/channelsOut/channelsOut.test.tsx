import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ChannelsOut from './channelsOut';

vi.mock('@utils/constants.ts', () => ({
  CHANNELS_OUT_MIN: 1,
  CHANNELS_OUT_MAX: 40
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, opts?: { min?: number; max?: number }) =>
      opts && opts.min !== undefined ? `${key}:${opts.min}-${opts.max}` : key
  })
}));

describe('<ChannelsOut />', () => {
  const mockSetValue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const enterValue = (v: number) =>
    fireEvent.change(screen.getByTestId('channelsOut'), { target: { value: String(v) } });

  test('renders correctly', () => {
    render(<ChannelsOut value={1} setValue={mockSetValue} />);
    expect(screen.getByTestId('channelsOut')).toBeInTheDocument();
  });

  test.each([[1], [40]])('accepts valid value %i and calls setValue', (value) => {
    render(<ChannelsOut value={2} setValue={mockSetValue} />);
    enterValue(value);
    expect(mockSetValue).toHaveBeenCalledWith(value);
    expect(screen.queryByText('channelsOut.error:1-40')).not.toBeInTheDocument();
  });

  test.each([[0], [1.5], [41]])('reports invalid value %s', (value) => {
    render(<ChannelsOut value={1} setValue={mockSetValue} />);
    enterValue(value);
    expect(mockSetValue).toHaveBeenCalledWith(value);
    expect(screen.getByText('channelsOut.error:1-40')).toBeInTheDocument();
  });

  test('steps by one whole channel within the allowed range', () => {
    render(<ChannelsOut value={2} setValue={mockSetValue} />);
    fireEvent.click(screen.getByTestId('channelsOutIncrement'));
    fireEvent.click(screen.getByTestId('channelsOutDecrement'));
    expect(mockSetValue).toHaveBeenNthCalledWith(1, 3);
    expect(mockSetValue).toHaveBeenNthCalledWith(2, 1);
  });
});
