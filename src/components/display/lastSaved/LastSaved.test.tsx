import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';
import LastSaved from './LastSaved';
import { presentDate, presentTime } from '@/utils/present/present';

// When the proposal was last saved, as the context gives it
const mockLastSaved = vi.hoisted(() => ({ savedOn: undefined as string | undefined }));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('@/services/saveDraft/LastSavedContext', () => ({
  useLastSaved: () => ({ lastSavedOn: () => mockLastSaved.savedOn })
}));

vi.mock('@utils/storage/store', () => ({
  storageObject: { useStore: () => ({ application: { content2: {} } }) }
}));

const renderSavedOn = (savedOn?: string) => {
  mockLastSaved.savedOn = savedOn;
  render(<LastSaved />);
};

const NOW = '2026-11-25T15:00:00Z';

describe('<LastSaved />', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(NOW), toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('shows only the time for a save today', () => {
    const savedOn = '2026-11-25T14:32:00Z';
    renderSavedOn(savedOn);
    expect(screen.getByText('saveBtn.lastSaved')).toBeInTheDocument();
    expect(screen.getByText(presentTime(savedOn))).toBeInTheDocument();
  });

  test('shows the date and time for a save on an earlier day', () => {
    const savedOn = '2026-11-20T09:00:00Z';
    renderSavedOn(savedOn);
    expect(screen.getByText(`${presentDate(savedOn)} ${presentTime(savedOn)}`)).toBeInTheDocument();
  });

  test.each([undefined, '', 'not a date'])('shows nothing for %j', (savedOn) => {
    renderSavedOn(savedOn);
    expect(screen.queryByTestId('lastSaved')).not.toBeInTheDocument();
  });
});
