import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import TechnicalPage from './TechnicalPage';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

// Mock login
vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

// Mock notify
const notifySuccess = vi.fn();
const notifyError = vi.fn();
vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifySuccess,
    notifyError
  })
}));

// Mock axios client
vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

// Mock storage
const mockProposal = {
  id: '123',
  technicalPDF: { documentId: 'technical-doc-123', isUploadedPdf: true },
  technicalLoadStatus: FileUploadStatus.INITIAL
};
const mockStore = {
  application: {
    content1: [0, 0, 0, 0],
    content2: mockProposal
  },
  helpComponent: vi.fn(),
  updateAppContent1: vi.fn(),
  updateAppContent2: vi.fn()
};
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => mockStore
  }
}));

vi.mock('../../components/info/helpPanel/HelpPanel', () => ({
  default: () => <div data-testid="mock-help-panel" />
}));

// Mock API calls
vi.mock('@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl', () => ({
  default: vi.fn().mockResolvedValue('https://upload-url')
}));
vi.mock('@services/axios/put/putUploadPDF/putUploadPDF', () => ({
  default: vi.fn().mockResolvedValue({})
}));
vi.mock('@services/axios/get/getPresignedDownloadUrl/getPresignedDownloadUrl', () => ({
  default: vi.fn().mockResolvedValue('https://download-url')
}));
vi.mock('@services/axios/get/getPresignedDeleteUrl/getPresignedDeleteUrl', () => ({
  default: vi.fn().mockResolvedValue('https://delete-url')
}));
vi.mock('@services/axios/delete/deletePDF/deletePDF.tsx', () => ({
  default: vi.fn().mockResolvedValue({})
}));

const wrapper = (component: React.ReactElement) => {
  return render(<AppFlowProvider>{component}</AppFlowProvider>);
};

describe('TechnicalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mock('@ska-telescope/ska-login-page', () => ({
      isLoggedIn: () => true
    }));
  });

  it('renders file upload and buttons when logged in', () => {
    wrapper(<TechnicalPage />);
    // expect(screen.getByTestId('fileUpload')).toBeInTheDocument();
    expect(screen.getByText('pdfUpload.technical.label.preview')).toBeInTheDocument();
    expect(screen.getByText('pdfUpload.technical.label.download')).toBeInTheDocument();
    expect(screen.getByText('pdfUpload.technical.label.delete')).toBeInTheDocument();
  });

  // it('uploads PDF and updates proposal', async () => {
  //   wrapper(<TechnicalPage />);
  //   const uploadFn = screen.getByTestId('fileUpload').getAttribute('uploadFunction');
  //   expect(uploadFn).toBeDefined();
  // });

  it('previews PDF and opens viewer', async () => {
    wrapper(<TechnicalPage />);
    fireEvent.click(screen.getByText('pdfUpload.technical.label.preview'));
    await waitFor(() => {
      expect(screen.getByTestId('pdf-wrapper')).toBeInTheDocument();
    });
  });

  it('downloads PDF and opens new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    wrapper(<TechnicalPage />);
    fireEvent.click(screen.getByText('pdfUpload.technical.label.download'));
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('https://download-url', '_blank');
    });
  });

  it('deletes PDF and updates proposal', async () => {
    wrapper(<TechnicalPage />);
    fireEvent.click(screen.getByText('pdfUpload.technical.label.delete'));
    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith('pdfDelete.technical.success', 5);
    });
  });

  // it('handles upload error gracefully', async () => {
  //   const PutUploadPDF = require('@services/axios/put/putUploadPDF/putUploadPDF').default;
  //   PutUploadPDF.mockResolvedValue({ error: true });
  //   wrapper(<TechnicalPage />);
  //   const uploadFn = screen.getByTestId('fileUpload').getAttribute('uploadFunction');
  //   expect(uploadFn).toBeDefined();
  // });

  it('triggers helpComponent and validation on mount', () => {
    wrapper(<TechnicalPage />);
    expect(mockStore.helpComponent).toHaveBeenCalledWith('page.6.help');
    expect(mockStore.updateAppContent1).toHaveBeenCalled();
  });
});
