import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import DataProductPage from './DataProductPage';
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
    osdCyclePolicy: { maxTargets: 1, maxObservations: 1, maxDataProducts: 1 }
  })
}));
vi.mock('react-router', () => ({ useNavigate: () => vi.fn() }));
vi.mock('../../components/layout/Shell/Shell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('../entry/DataProduct/DataProduct', () => ({
  default: () => <div data-testid="dataProductEntryStub" />
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
  wrapper(<DataProductPage />);
};

describe('<DataProductPage />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders correctly', () => {
    wrapper(<DataProductPage />);
  });

  test('shows the data product when there is no target yet', () => {
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
      dataProductSDP: [{ id: 'sdp-1', observationId: 'obs-1', data: {} }]
    });

    expect(screen.getByTestId('dataProductEntryStub')).toBeInTheDocument();
    expect(screen.queryByTestId('noObservationsNotification')).not.toBeInTheDocument();
  });

  test('shows the same no-observation message for every proposal type', () => {
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [],
      dataProductSDP: []
    });

    expect(screen.queryByTestId('dataProductEntryStub')).not.toBeInTheDocument();
    expect(screen.getByText('error.noObservations')).toBeInTheDocument();
  });
});
