import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import ObservationPage from './ObservationPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { DEFAULT_CONTINUUM_OBSERVATION_LOW, PROPOSAL_TYPE } from '@/utils/constants';
import completeMockStore from '@/utils/MockStore';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: true,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../components/layout/Shell/Shell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('../entry/ObservationEntry/ObservationEntry', () => ({
  default: () => <div data-testid="observationEntryStub" />
}));

const renderWithProposal = (proposal: object) => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: {
      ...completeMockStore.application,
      content1: [],
      content2: { id: 'prsl-1', targets: [], targetObservation: [], ...proposal }
    }
  } as any);
  wrapper(<ObservationPage />);
};

describe('<ObservationPage />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders correctly', () => {
    wrapper(<ObservationPage />);
  });

  test('shows the observation when there is no target yet', () => {
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }]
    });

    expect(screen.getByTestId('observationEntryStub')).toBeInTheDocument();
    expect(screen.queryByTestId('noObservationsNotification')).not.toBeInTheDocument();
  });

  test('shows the same no-observation message for every proposal type', () => {
    renderWithProposal({ proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION, observations: [] });

    expect(screen.queryByTestId('observationEntryStub')).not.toBeInTheDocument();
    expect(screen.getByText('error.noObservations')).toBeInTheDocument();
  });
});
