import { describe, expect, test, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ReviewListPage from './ReviewListPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import getProposalsReviewable from '@/services/axios/get/getProposalsReviewable/getProposalsReviewable';
import GetProposalReviewList from '@services/axios/get/getProposalReviewList/getProposalReviewList.tsx';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import Proposal from '@/utils/types/proposal';

// ---- Module mocks ----

vi.mock('@/utils/aaa/aaaUtils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useInitializeAccessStore: vi.fn()
  };
});

vi.mock('@/services/axios/get/getProposalsReviewable/getProposalsReviewable', () => ({
  default: vi.fn()
}));

vi.mock('@services/axios/get/getProposalReviewList/getProposalReviewList.tsx', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/put/putProposalReview/putProposalReview', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {}, refreshAuthToken: vi.fn() })
}));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn()
  })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: vi.fn()
}));

// Overrides the global react-i18next mock (setupTests.ts, which just echoes the key back) so the
// rendered title reflects which namespace list useScopedTranslation actually resolved to. That
// namespace choice - driven by ReviewListPage's own reviewListIsSV - is the real behaviour under
// test, mirroring the real sv.json/pht.json copy for reviewProposalList.title.
vi.mock('react-i18next', () => ({
  useTranslation: (namespaces: string[] = []) => ({
    t: (key: string) => {
      if (key === 'reviewProposalList.title') {
        return namespaces.includes('sv') ? 'Review Science Verification Ideas' : 'Review Proposals';
      }
      return key;
    },
    i18n: { changeLanguage: () => Promise.resolve() }
  }),
  initReactI18next: { type: '3rdParty', init: () => {} }
}));

// ---- Helpers ----

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

const mockProposal = (cycle: string): Partial<Proposal> => ({
  id: 'prsl-1',
  title: 'In a galaxy far, far away',
  status: 'Submitted',
  cycle,
  lastUpdated: '2026-01-01T00:00:00Z'
});

describe('<ReviewListPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (GetProposalReviewList as Mock).mockResolvedValue([]);
    (useOSDAccessors as Mock).mockReturnValue({
      isSV: false,
      osdCycleId: 'CYCLE-1',
      getCycle: vi.fn(() => null)
    });
  });

  test('renders correctly', async () => {
    (getProposalsReviewable as Mock).mockResolvedValue([]);
    wrapper(<ReviewListPage />);

    // Wait for the proposals/reviews fetch effects to settle so their state updates land inside
    // act() instead of firing after the test has already finished.
    await waitFor(() => {
      expect(screen.getByTestId('helpPanelId')).toBeInTheDocument();
    });
  });

  // Covers the ReviewListPage.tsx bug where the list title is meant to reflect the reviewed
  // proposal's own cycle type (see its reviewListIsSV comment), not the wording that happened to
  // come back from the backend for whatever's currently in the live review queue.
  test('titles the list for Science Verification when the reviewed proposal is under an SV cycle', async () => {
    (getProposalsReviewable as Mock).mockResolvedValue([mockProposal('CYCLE-SV-1')]);
    (useOSDAccessors as Mock).mockReturnValue({
      isSV: true,
      osdCycleId: 'CYCLE-SV-1',
      getCycle: vi.fn(() => ({ type: 'Science Verification' }))
    });

    wrapper(<ReviewListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pageTitle')).toHaveTextContent(
        'REVIEW SCIENCE VERIFICATION IDEAS'
      );
    });
  });

  test('titles the list for standard Proposals when the reviewed proposal is under a Proposal cycle', async () => {
    (getProposalsReviewable as Mock).mockResolvedValue([mockProposal('CYCLE-PRP-1')]);
    (useOSDAccessors as Mock).mockReturnValue({
      isSV: false,
      osdCycleId: 'CYCLE-PRP-1',
      getCycle: vi.fn(() => ({ type: 'Proposal' }))
    });

    wrapper(<ReviewListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('pageTitle')).toHaveTextContent('REVIEW PROPOSALS');
    });
  });
});
