import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposal from '@services/axios/post/postProposal/postProposal.tsx';
import { MockProposalBackend } from '@services/axios/get/getProposal/mockProposalBackend';
import PageFooterPPT from './PageFooterPPT';
import { NEW_PROPOSAL_ACCESS } from '@/utils/types/proposalAccess';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

vi.mock('@services/axios/post/postProposal/postProposal.tsx', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

const mockNavigate = vi.fn();
((useNavigate as unknown) as vi.Mock).mockReturnValue(mockNavigate);

const mockProposal = { id: null, title: 'Test Proposal' };
const mockObservatoryData = {
  observatoryPolicy: {
    cycleInformation: {
      cycleId: 'CYCLE-1'
    }
  }
};
const mockAccess = [NEW_PROPOSAL_ACCESS];

const mockNotification = {
  level: AlertColorTypes.Info,
  message: 'Test message',
  delay: 3000,
  okRequired: false
};

(PostProposal as ReturnType<typeof vi.fn>).mockResolvedValue(MockProposalBackend);

beforeEach(() => {
  storageObject.useStore = () => ({
    application: {
      content2: mockProposal,
      content3: mockObservatoryData,
      content4: mockAccess,
      content5: mockNotification
    },
    updateAppContent2: vi.fn(),
    updateAppContent4: vi.fn(),
    updateAppContent5: vi.fn()
  });
});

const wrapper = (component: React.ReactElement) => {
  return render(<AppFlowProvider>{component}</AppFlowProvider>);
};

describe('PageFooterPPT', () => {
  it('renders previous and next buttons when pageNo is valid', () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('nextButtonTestId')).toBeInTheDocument();
  });

  it('does not render previous button on first page', () => {
    wrapper(<PageFooterPPT pageNo={0} />);
    expect(screen.queryByTestId('prevButtonTestId')).not.toBeInTheDocument();
  });

  /* Not currently needed
  it('renders TimedAlert when notification message exists', () => {
    wrapper(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('timeAlertFooter')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
  */

  it('calls createProposal when pageNo is -1 and user is logged in', async () => {
    wrapper(<PageFooterPPT pageNo={-1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(PostProposal).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(expect.anything());
    });
  });

  it('disables next button when buttonDisabled is true', () => {
    wrapper(<PageFooterPPT pageNo={1} buttonDisabled />);
    expect(screen.getByTestId('nextButtonTestId')).toBeDisabled();
  });
});
