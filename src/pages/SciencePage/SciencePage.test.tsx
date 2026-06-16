import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import SciencePage from './SciencePage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

// Mock login
vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

// Mock notify
const notifySuccess = vi.fn();
const notifyError = vi.fn();
const notifyWarning = vi.fn();
vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifySuccess,
    notifyError,
    notifyWarning
  })
}));

// Mock axios client
vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

// Mock storage
const mockProposal = {
  id: '123',
  sciencePDF: { documentId: 'science-doc-123', isUploadedPdf: true },
  scienceLoadStatus: FileUploadStatus.INITIAL
};
const mockStore = {
  application: {
    content1: [0, 0, 0, 0],
    content2: mockProposal
  },
  helpComponent: vi.fn(),
  helpComponentURL: vi.fn(),
  updateAppContent1: vi.fn(),
  updateAppContent2: vi.fn()
};
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => mockStore
  }
}));

vi.mock('@/utils/aaa/aaaUtils', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    accessSubmit: vi.fn(() => true)
  };
});

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

// Mock getPdfPageCount
const mockGetPdfPageCount = vi.fn();
vi.mock('@/utils/pdf/pdfPageCount', () => ({
  getPdfPageCount: (...args: any[]) => mockGetPdfPageCount(...args)
}));

// Mock FileUpload to capture setFile and uploadFunction props
let capturedSetFile: ((file: File | '') => void) | undefined;
let capturedUploadFunction: ((file: File) => Promise<void>) | undefined;
let capturedUploadDisabled: boolean | undefined;
let capturedDropzoneAccepted: Record<string, string[]> | undefined;
vi.mock('@ska-telescope/ska-gui-components', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    FileUpload: vi.fn(({ setFile, uploadFunction, uploadDisabled, dropzoneAccepted, suffix }: any) => {
      capturedSetFile = setFile;
      capturedUploadFunction = uploadFunction;
      capturedUploadDisabled = uploadDisabled;
      capturedDropzoneAccepted = dropzoneAccepted;
      return (
        <>
          <input data-testid="mock-file-input" type="file" />
          {suffix}
        </>
      );
    })
  };
});

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

const wrapper = (component: React.ReactElement) => {
  return render(<ThemeA11yProvider>{component}</ThemeA11yProvider>);
};

const makeFile = (name = 'test.pdf', sizeOverride?: number): File => {
  const file = new File(['%PDF-1.7\ndummy'], name, { type: 'application/pdf' });
  if (sizeOverride !== undefined) {
    Object.defineProperty(file, 'size', { value: sizeOverride });
  }
  return file;
};

const makeNonPdfFile = (name = 'test.txt'): File => new File(['dummy'], name, { type: 'text/plain' });
const makeFakePdfFile = (name = 'fake.pdf'): File =>
  new File(['not-a-pdf'], name, { type: 'application/pdf' });

import GetPresignedUploadUrl from '@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl';
import PutUploadPDF from '@services/axios/put/putUploadPDF/putUploadPDF';

describe('SciencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSetFile = undefined;
    capturedUploadFunction = undefined;
    capturedUploadDisabled = undefined;
    capturedDropzoneAccepted = undefined;
    mockGetPdfPageCount.mockResolvedValue(2);
    vi.mock('@ska-telescope/ska-login-page', () => ({
      isLoggedIn: () => true
    }));
  });

  it('renders file upload and buttons when logged in', () => {
    wrapper(<SciencePage />);
    expect(screen.getByText('pdfUpload.science.label.preview')).toBeInTheDocument();
    expect(screen.getByText('pdfUpload.science.label.download')).toBeInTheDocument();
    expect(screen.getByText('pdfUpload.science.label.delete')).toBeInTheDocument();
  });

  it('previews PDF and opens viewer', async () => {
    wrapper(<SciencePage />);
    fireEvent.click(screen.getByText('pdfUpload.science.label.preview'));
    await waitFor(() => {
      expect(screen.getByTestId('pdf-wrapper')).toBeInTheDocument();
    });
  });

  it('downloads PDF and opens new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    wrapper(<SciencePage />);
    fireEvent.click(screen.getByText('pdfUpload.science.label.download'));
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith('https://download-url', '_blank');
    });
  });

  it('deletes PDF and updates proposal', async () => {
    wrapper(<SciencePage />);
    fireEvent.click(screen.getByText('pdfUpload.science.label.delete'));
    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith('pdfDelete.science.success');
    });
  });

  describe('PDF validation', () => {
    it('file within size limit with 4 pages: no error, upload proceeds', async () => {
      mockGetPdfPageCount.mockResolvedValue(4);
      wrapper(<SciencePage />);

      const file = makeFile('valid.pdf');
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
      expect(GetPresignedUploadUrl).toHaveBeenCalled();
      expect(PutUploadPDF).toHaveBeenCalled();
      expect(notifyWarning).toHaveBeenCalledWith('pdfUpload.science.warning');
    });

    it('file exactly 100 MB: no error, upload proceeds', async () => {
      mockGetPdfPageCount.mockResolvedValue(2);
      wrapper(<SciencePage />);

      const file = makeFile('exact.pdf', 100 * 1024 * 1024);
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(screen.queryByText('pdfUpload.science.sizeError')).not.toBeInTheDocument();
      expect(GetPresignedUploadUrl).toHaveBeenCalled();
    });

    it('file 100 MB + 1 byte: sizeError shown, upload blocked', async () => {
      wrapper(<SciencePage />);

      const file = makeFile('too-big.pdf', 100 * 1024 * 1024 + 1);
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(screen.getByText('pdfUpload.science.sizeError')).toBeInTheDocument();
      expect(mockGetPdfPageCount).not.toHaveBeenCalled();
      expect(GetPresignedUploadUrl).not.toHaveBeenCalled();
      expect(PutUploadPDF).not.toHaveBeenCalled();
      expect(notifyWarning).not.toHaveBeenCalled();
    });

    it('file within size limit but 5 pages: pageError shown, upload blocked', async () => {
      mockGetPdfPageCount.mockResolvedValue(5);
      wrapper(<SciencePage />);

      const file = makeFile('too-long.pdf');
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(screen.getByText('pdfUpload.science.pageError')).toBeInTheDocument();
      expect(GetPresignedUploadUrl).not.toHaveBeenCalled();
      expect(PutUploadPDF).not.toHaveBeenCalled();
      expect(notifyWarning).not.toHaveBeenCalled();
    });

    it('clear file: error cleared and proposal state cleared', async () => {
      mockGetPdfPageCount.mockResolvedValue(5);
      wrapper(<SciencePage />);

      const file = makeFile('too-long.pdf');
      await act(async () => {
        await capturedUploadFunction!(file);
      });
      expect(screen.getByText('pdfUpload.science.pageError')).toBeInTheDocument();

      act(() => {
        capturedSetFile!('');
      });

      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.pageError')).not.toBeInTheDocument();
      });
      expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
        expect.objectContaining({ sciencePDF: null })
      );
    });

    it('unreadable PDF: invalidFileError shown, upload blocked', async () => {
      mockGetPdfPageCount.mockRejectedValue(new Error('Corrupt PDF'));
      wrapper(<SciencePage />);

      const file = makeFile('corrupt.pdf');
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      expect(GetPresignedUploadUrl).not.toHaveBeenCalled();
      expect(notifyWarning).not.toHaveBeenCalled();
    });

    it('stale validation ignored when second file selected before first resolves', async () => {
      let resolveFirstPageCount!: (n: number) => void;
      const deferredFirst = new Promise<number>(res => {
        resolveFirstPageCount = res;
      });
      mockGetPdfPageCount.mockReturnValueOnce(deferredFirst).mockResolvedValueOnce(2);

      wrapper(<SciencePage />);

      const file1 = makeFile('file1.pdf');
      const file2 = makeFile('file2.pdf');

      act(() => {
        capturedSetFile!(file1);
      });
      act(() => {
        capturedSetFile!(file2);
      });

      // file2 validation resolves (2 pages — valid); no error
      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.pageError')).not.toBeInTheDocument();
      });

      // Now resolve file1 with 5 pages (would be an error) — should be ignored
      await act(async () => {
        resolveFirstPageCount(5);
        await new Promise(r => setTimeout(r, 0));
      });

      expect(screen.queryByText('pdfUpload.science.pageError')).not.toBeInTheDocument();
    });

    it('uploadDisabled is false when there is no error', () => {
      wrapper(<SciencePage />);
      expect(capturedUploadDisabled).toBe(false);
    });

    it('dropzone pre-filters file type to PDF in picker configuration', () => {
      wrapper(<SciencePage />);
      expect(capturedDropzoneAccepted).toEqual({ 'application/pdf': ['.pdf'] });
    });

    it('selecting non-PDF file shows invalidFileError', async () => {
      wrapper(<SciencePage />);
      act(() => {
        capturedSetFile!(makeNonPdfFile());
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
    });

    it('file selector non-PDF change event shows invalidFileError', async () => {
      wrapper(<SciencePage />);
      fireEvent.change(screen.getByTestId('mock-file-input'), {
        target: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
    });

    it('pdf extension/mime without PDF magic shows invalidFileError', async () => {
      wrapper(<SciencePage />);
      await act(async () => {
        await capturedUploadFunction!(makeFakePdfFile());
      });
      expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      expect(GetPresignedUploadUrl).not.toHaveBeenCalled();
      expect(mockGetPdfPageCount).not.toHaveBeenCalled();
    });

    it('uploadDisabled is true when pdfError is set', async () => {
      mockGetPdfPageCount.mockResolvedValue(5);
      wrapper(<SciencePage />);

      const file = makeFile('too-long.pdf');
      await act(async () => {
        await capturedUploadFunction!(file);
      });

      expect(capturedUploadDisabled).toBe(true);
    });

    it('upload clears a previous error when valid file is uploaded', async () => {
      mockGetPdfPageCount.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
      wrapper(<SciencePage />);

      const badFile = makeFile('bad.pdf');
      await act(async () => {
        await capturedUploadFunction!(badFile);
      });
      expect(screen.getByText('pdfUpload.science.pageError')).toBeInTheDocument();

      const goodFile = makeFile('good.pdf');
      await act(async () => {
        await capturedUploadFunction!(goodFile);
      });

      expect(screen.queryByText('pdfUpload.science.pageError')).not.toBeInTheDocument();
      expect(GetPresignedUploadUrl).toHaveBeenCalled();
    });
  });
});
