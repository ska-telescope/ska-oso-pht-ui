import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';
import LastSaved from './LastSaved';
import { presentDate, presentTime } from '@/utils/present/present';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string, options?: { value?: string }) =>
      options?.value === undefined ? key : `${key}|${options.value}`
  })
}));

const NOW = new Date('2026-08-13T12:00:00.000Z');

describe('<LastSaved />', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('renders nothing without a timestamp', () => {
    render(<LastSaved />);
    expect(screen.queryByTestId('lastSavedTestId')).toBeNull();
  });

  test('renders nothing for an unparseable timestamp', () => {
    render(<LastSaved lastUpdated="not-a-date" />);
    expect(screen.queryByTestId('lastSavedTestId')).toBeNull();
  });

  test('shows the time only for a save today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    // Same instant as "now", so it is the same local calendar day in every
    // timezone the test might run in.
    const stamp = NOW.toISOString();

    render(<LastSaved lastUpdated={stamp} />);

    expect(screen.getByTestId('lastSavedTestId')).toHaveTextContent(
      `saveBtn.lastSaved|${presentTime(stamp)}`
    );
    expect(screen.getByTestId('lastSavedTestId')).not.toHaveTextContent(presentDate(stamp));
  });

  test('shows date and time for a save on an earlier day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    // 48h back is a different local day everywhere.
    const stamp = new Date(NOW.getTime() - 48 * 60 * 60 * 1000).toISOString();

    render(<LastSaved lastUpdated={stamp} />);

    expect(screen.getByTestId('lastSavedTestId')).toHaveTextContent(
      `saveBtn.lastSaved|${presentDate(stamp)} ${presentTime(stamp)}`
    );
  });

  test('parses the compact backend timestamp form', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    render(<LastSaved lastUpdated="20260811T12:00:00.000000Z" />);

    expect(screen.queryByTestId('lastSavedTestId')).not.toBeNull();
  });
});
