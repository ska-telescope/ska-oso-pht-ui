import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Proposal } from '@utils/types/proposal.tsx';
import { SaveDraftProvider } from './SaveDraftProvider';
import { useLastSaved } from './LastSavedContext';

vi.mock('./AutoSaveTimerService', () => ({
  AutoSaveTimerService: () => <div data-testid="timerService" />
}));

vi.mock('./AutoSaveNavigationService', () => ({
  AutoSaveNavigationService: () => <div data-testid="navigationService" />
}));

const proposal = { id: 'prsl-1', lastUpdated: '2026-11-20T09:00:00Z' } as Proposal;

// Shows when the proposal was last saved, with a button standing in for a save
const Page = () => {
  const { lastSavedOn, recordSave } = useLastSaved();
  return (
    <>
      <div data-testid="page">{lastSavedOn(proposal)}</div>
      <button onClick={() => recordSave('prsl-1', '2026-11-25T14:32:00Z')}>save</button>
    </>
  );
};

describe('<SaveDraftProvider />', () => {
  test('runs both automatic saves alongside its pages', () => {
    render(
      <SaveDraftProvider>
        <Page />
      </SaveDraftProvider>
    );
    expect(screen.getByTestId('timerService')).toBeInTheDocument();
    expect(screen.getByTestId('navigationService')).toBeInTheDocument();
    expect(screen.getByTestId('page')).toBeInTheDocument();
  });

  test('gives its pages the saves recorded below it', () => {
    render(
      <SaveDraftProvider>
        <Page />
      </SaveDraftProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
    expect(screen.getByTestId('page')).toHaveTextContent('2026-11-25T14:32:00Z');
  });
});
