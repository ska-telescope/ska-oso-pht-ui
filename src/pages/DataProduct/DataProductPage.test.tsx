import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@utils/storage/store';
import DataProductPage from './DataProductPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  PAGE_DATA_PRODUCTS,
  PROPOSAL_TYPE,
  STATUS_ERROR,
  STATUS_OK,
  STATUS_PARTIAL
} from '@/utils/constants';
import completeMockStore from '@/utils/MockStore';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { DATA_PRODUCT_KIND, newDataProduct } from '@/models/proposals/dataProducts';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>
        <TestProposalFormProvider>{component}</TestProposalFormProvider>
      </ThemeA11yProvider>
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
vi.mock('./DataProductInPlace', () => ({
  default: () => <div data-testid="dataProductInPlaceStub" />
}));

const renderWithProposal = (
  proposal: object,
  statuses = Array(PAGE_DATA_PRODUCTS + 1).fill(STATUS_PARTIAL)
) => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: {
      ...completeMockStore.application,
      content1: statuses,
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

    expect(screen.getByTestId('dataProductInPlaceStub')).toBeInTheDocument();
    expect(screen.queryByTestId('noObservationsNotification')).not.toBeInTheDocument();
  });

  test('shows the same no-observation message for every proposal type', () => {
    renderWithProposal({
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [],
      dataProductSDP: []
    });

    expect(screen.queryByTestId('dataProductInPlaceStub')).not.toBeInTheDocument();
    expect(screen.getByText('error.noObservations')).toBeInTheDocument();
  });

  // The status of the Data Products page the page last wrote
  const pageStatus = () =>
    vi.mocked(completeMockStore.updateAppContent1).mock.calls.at(-1)?.[0][PAGE_DATA_PRODUCTS];

  test.each([
    [
      'with the link to its data product',
      [{ targetId: 't1', observationId: 'obs-1', dataProductsSDPId: 'sdp-1' }],
      STATUS_OK
    ],
    ['without a link', [], STATUS_ERROR]
  ])(
    'sets its status from the submit schema for an SV proposal %s',
    (_, targetObservation, status) => {
      vi.mocked(completeMockStore.updateAppContent1).mockClear();
      renderWithProposal({
        proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
        observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
        dataProducts: [
          { ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'), id: 'sdp-1' }
        ],
        targetObservation
      });

      expect(pageStatus()).toBe(status);
    }
  );

  test('leaves the statuses alone when its own is already right', () => {
    vi.mocked(completeMockStore.updateAppContent1).mockClear();
    renderWithProposal(
      {
        proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
        observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
        dataProducts: [],
        targetObservation: []
      },
      Array(PAGE_DATA_PRODUCTS + 1).fill(STATUS_ERROR)
    );

    expect(completeMockStore.updateAppContent1).not.toHaveBeenCalled();
  });
});
