import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { storageObject, StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposal from '@services/axios/post/postProposal/postProposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend';
import PageFooterPPT from './PageFooterPPT';
import { NEW_PROPOSAL_ACCESS } from '@/utils/types/proposalAccess';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// --- Additional mocks ---
vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifyError: vi.fn(),
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn()
  })
}));

vi.mock('@/utils/validation/validation', () => ({
  validateProposalNavigation: vi.fn(() => true)
}));

// --- Existing mocks ---
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    isSV: false,
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

vi.mock('@services/axios/post/postProposal/postProposal.tsx', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

// --- Setup ---
const mockNavigate = vi.fn();
((useNavigate as unknown) as Mock).mockReturnValue(mockNavigate);

const mockProposal = { id: 123, title: 'Test Proposal' };
const mockAccess = [NEW_PROPOSAL_ACCESS];

const mockNotification = {
  level: AlertColorTypes.Error,
  message: 'Test message',
  delay: 3000,
  okRequired: false
};

((PostProposal as unknown) as Mock).mockResolvedValue(MockProposalBackend);

beforeEach(() => {
  vi.clearAllMocks();

  storageObject.useStore = () =>
    ({
      application: {
        content2: mockProposal,
        content4: mockAccess,
        content5: mockNotification,
        content1: {},
        content6: {},
        content7: {},
        content8: {},
        content9: {}
      },
      updateAppContent2: vi.fn(),
      updateAppContent4: vi.fn()
    } as any);
});

const wrapper = (component: React.ReactElement) =>
  render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );

// --- Tests ---
describe('PageFooterPPT', () => {
  it('renders next button on a normal page', () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('nextButtonTestId')).toBeInTheDocument();
  });

  it('hides previous button on first page', () => {
    wrapper(<PageFooterPPT pageNo={0} />);
    expect(screen.queryByTestId('prevButtonTestId')).not.toBeInTheDocument();
  });

  it('renders notification when present', () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('timeAlertFooter')).toBeInTheDocument();
  });

  it('disables next button when buttonDisabled is true', () => {
    wrapper(<PageFooterPPT pageNo={1} buttonDisabled />);
    expect(screen.getByTestId('nextButtonTestId')).toBeDisabled();
  });

  it('calls createProposal when pageNo = -1', async () => {
    wrapper(<PageFooterPPT pageNo={-1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(PostProposal).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('navigates to next page when next button clicked', async () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('navigates to previous page when prev button clicked', async () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    fireEvent.click(screen.getByTestId('prevButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('uses correct label for next button', () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    expect(screen.getByTestId('nextButtonTestId').textContent).toContain('page.');
  });

  it('uses correct label for prev button', () => {
    wrapper(<PageFooterPPT pageNo={2} />);
    expect(screen.getByTestId('prevButtonTestId').textContent).toContain('page.');
  });
});
