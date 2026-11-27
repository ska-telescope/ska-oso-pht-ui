import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TechnicalPage from './TechnicalPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { FormProvider, useForm } from 'react-hook-form';
import { ProposalType } from '@/models/proposals/proposal';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';

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

// Mock storage
const mockProposal: Partial<ProposalType> = {
  prslId: '123',
  technicalPDF: { documentId: 'technical-doc-123', isUploadedPdf: true }
};
const mockStore = {
  application: {
    content1: [0, 0, 0, 0]
  },
  helpComponent: vi.fn(),
  helpComponentURL: vi.fn(),
  updateAppContent1: vi.fn()
};

vi.mock('@/utils/aaa/aaaUtils', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    accessSubmit: vi.fn(() => true)
  };
});

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => mockStore
  }
}));

vi.mock('../../components/info/helpPanel/HelpPanel', () => ({
  default: () => <div data-testid="mock-help-panel" />
}));

// Mock API calls
vi.mock('@/services/api/documents', () => ({
  getUploadUrl: vi.fn().mockResolvedValue({ data: 'https://upload-url' }),
  uploadToSignedUrl: vi.fn().mockResolvedValue({ data: undefined }),
  getDownloadUrl: vi.fn().mockResolvedValue({ data: 'https://download-url' }),
  getDeleteUrl: vi.fn().mockResolvedValue({ data: 'https://delete-url' }),
  deleteAtSignedUrl: vi.fn().mockResolvedValue({ data: undefined })
}));

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const methods = useForm<ProposalType>({
      defaultValues: { ...getProposalFormDefaults(), ...mockProposal }
    });
    return (
      <FormProvider {...methods}>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </FormProvider>
    );
  };
  return render(<FormWrapper />);
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('TechnicalPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  //   vi.mocked(uploadToSignedUrl).mockResolvedValue({ error: 'error' });
  //   wrapper(<TechnicalPage />);
  //   const uploadFn = screen.getByTestId('fileUpload').getAttribute('uploadFunction');
  //   expect(uploadFn).toBeDefined();
  // });

  // it('triggers setHelp and validation on mount', () => {
  //   wrapper(<TechnicalPage />);
  //   expect(mockStore.setHelp).toHaveBeenCalledWith('page.6.help');
  //   expect(mockStore.updateAppContent1).toHaveBeenCalled();
  // });
});
