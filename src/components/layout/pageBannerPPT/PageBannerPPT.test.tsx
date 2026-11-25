import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import PageBannerPPT from './PageBannerPPT';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { PAGE_TEAM } from '@/utils/constants';

const mockNotifySuccess = vi.hoisted(() => vi.fn());
const mockSaveDraft = vi.hoisted(() => vi.fn());

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: vi.fn(), notifySuccess: mockNotifySuccess })
}));

vi.mock('@/models/proposals/useSaveDraft', () => ({
  useSaveDraft: () => ({
    saveDraft: mockSaveDraft,
    isSavePage: () => true,
    isSaveBlocked: () => false
  })
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => true)
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {} })
}));

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<PageBannerPPT />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    wrapper(<PageBannerPPT pageNo={1} />);
  });

  describe('Save button', () => {
    const clickSave = () => {
      wrapper(<PageBannerPPT pageNo={PAGE_TEAM} />);
      screen.getByTestId('saveBtn').click();
    };

    test('confirms a successful save', async () => {
      mockSaveDraft.mockResolvedValue(true);
      clickSave();
      await waitFor(() => expect(mockNotifySuccess).toHaveBeenCalledWith('saveBtn.success'));
    });

    test('does not confirm a save that did not happen', async () => {
      mockSaveDraft.mockResolvedValue(false);
      clickSave();
      await waitFor(() => expect(mockSaveDraft).toHaveBeenCalled());
      expect(mockNotifySuccess).not.toHaveBeenCalled();
    });
  });
});
