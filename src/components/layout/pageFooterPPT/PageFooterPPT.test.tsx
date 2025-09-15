import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import PostProposal from '@services/axios/post/postProposal/postProposal.tsx';
import PageFooterPPT from './PageFooterPPT';
import { NEW_PROPOSAL_ACCESS } from '@/utils/types/proposalAccess';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

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

(PostProposal as ReturnType<typeof vi.fn>).mockResolvedValue({
  error: null,
  id: '12345'
});

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

describe('PageFooterPPT', () => {
  it('renders previous and next buttons when pageNo is valid', () => {
    render(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('nextButtonTestId')).toBeInTheDocument();
  });

  it('does not render previous button on first page', () => {
    render(<PageFooterPPT pageNo={0} />);
    expect(screen.queryByTestId('prevButtonTestId')).not.toBeInTheDocument();
  });

  it('renders TimedAlert when notification message exists', () => {
    render(<PageFooterPPT pageNo={1} />);
    expect(screen.getByTestId('timeAlertFooter')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('calls createProposal when pageNo is -1 and user is logged in', async () => {
    render(<PageFooterPPT pageNo={-1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(PostProposal).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(expect.anything());
    });
  });

  //TODO: Resolve
  it.skip('creates dummy proposal when not logged in', async () => {
    const isLoggedIn = await import('@ska-telescope/ska-login-page');
    isLoggedIn.isLoggedIn = vi.fn(() => false);

    render(<PageFooterPPT pageNo={-1} />);
    fireEvent.click(screen.getByTestId('nextButtonTestId'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.anything());
    });
  });

  it('disables next button when buttonDisabled is true', () => {
    render(<PageFooterPPT pageNo={1} buttonDisabled />);
    expect(screen.getByTestId('nextButtonTestId')).toBeDisabled();
  });
});
