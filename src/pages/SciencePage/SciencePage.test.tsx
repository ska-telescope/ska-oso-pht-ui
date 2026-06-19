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
let capturedClearDisabled: boolean | undefined;
let capturedChooseDisabled: boolean | undefined;
let capturedDropzoneAccepted: Record<string, string[]> | undefined;
let capturedDropzonePrompt: string | undefined;
let capturedFile: string | null | undefined;
vi.mock('@ska-telescope/ska-gui-components', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    FileUpload: vi.fn(
      ({
        setFile,
        uploadFunction,
        uploadDisabled,
        clearDisabled,
        chooseDisabled,
        dropzoneAccepted,
        dropzonePrompt,
        file,
        suffix
      }: any) => {
      capturedSetFile = setFile;
      capturedUploadFunction = uploadFunction;
      capturedUploadDisabled = uploadDisabled;
      capturedClearDisabled = clearDisabled;
      capturedChooseDisabled = chooseDisabled;
      capturedDropzoneAccepted = dropzoneAccepted;
      capturedDropzonePrompt = dropzonePrompt;
      capturedFile = file;
      return (
        <>
          <input data-testid="mock-file-input" type="file" />
          {suffix}
        </>
      );
      }
    )
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
const makeUnreadablePdfFile = (name = 'unreadable.pdf'): File => makeFile(name);

import GetPresignedUploadUrl from '@services/axios/get/getPresignedUploadUrl/getPresignedUploadUrl';
import PutUploadPDF from '@services/axios/put/putUploadPDF/putUploadPDF';

describe('SciencePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.application.content2 = {
      ...mockProposal,
      sciencePDF: mockProposal.sciencePDF ? { ...mockProposal.sciencePDF } : null
    };
    capturedSetFile = undefined;
    capturedUploadFunction = undefined;
    capturedUploadDisabled = undefined;
    capturedClearDisabled = undefined;
    capturedChooseDisabled = undefined;
    capturedDropzoneAccepted = undefined;
    capturedDropzonePrompt = undefined;
    capturedFile = undefined;
    mockGetPdfPageCount.mockImplementation(async (file: File) => {
      if (
        file.type !== 'application/pdf' ||
        file.name.includes('fake') ||
        file.name.includes('unreadable')
      ) {
        throw new Error('Invalid PDF');
      }
      return 2;
    });
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

  it('deletes PDF and remounts FileUpload to clear displayed filename', async () => {
    const FileUploadMock = (await import('@ska-telescope/ska-gui-components')).FileUpload as any;
    wrapper(<SciencePage />);
    const callsAfterRender = FileUploadMock.mock.calls.length;

    fireEvent.click(screen.getByText('pdfUpload.science.label.delete'));

    await waitFor(() => {
      expect(notifySuccess).toHaveBeenCalledWith('pdfDelete.science.success');
      expect(FileUploadMock.mock.calls.length).toBeGreaterThan(callsAfterRender);
    });
    // originalFile (the `file` prop) must be cleared, otherwise the dropzone
    // re-renders the deleted filename after the remount.
    expect(capturedFile).toBeNull();
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
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
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
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      expect(capturedUploadDisabled).toBe(false);
    });

    it('clearDisabled is true when an uploaded science PDF exists and there is no PDF error', () => {
      wrapper(<SciencePage />);
      expect(capturedClearDisabled).toBe(true);
    });

    it('clearDisabled becomes false when there is a PDF validation error', async () => {
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      fireEvent.change(screen.getByTestId('mock-file-input'), {
        target: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
      expect(capturedClearDisabled).toBe(false);
    });

    it('dropzone pre-filters file type to PDF in picker configuration', () => {
      wrapper(<SciencePage />);
      expect(capturedDropzoneAccepted).toEqual({ 'application/pdf': ['.pdf'] });
    });

    it('uploaded science PDF disables selection, hides upload/clear controls and changes prompt', () => {
      wrapper(<SciencePage />);
      expect(capturedChooseDisabled).toBe(true);
      expect(capturedFile).toBe('science-doc-123fileType.pdf');
      expect(capturedUploadDisabled).toBe(true);
      expect(capturedDropzonePrompt).toBe('pdfUpload.science.prompt.deleteToEnableUpload');
    });

    it('uploaded science PDF ignores file selector change events', async () => {
      wrapper(<SciencePage />);
      fireEvent.change(screen.getByTestId('mock-file-input'), {
        target: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.invalidFileError')).not.toBeInTheDocument();
      });
    });

    it('uploaded science PDF ignores drop events', async () => {
      wrapper(<SciencePage />);
      fireEvent.drop(screen.getByTestId('mock-file-input'), {
        dataTransfer: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.invalidFileError')).not.toBeInTheDocument();
      });
    });

    it('selecting non-PDF file shows invalidFileError', async () => {
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      fireEvent.change(screen.getByTestId('mock-file-input'), {
        target: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
    });

    it('file selector non-PDF change event shows invalidFileError', async () => {
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      fireEvent.change(screen.getByTestId('mock-file-input'), {
        target: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
    });

    it('dropzone non-PDF drop event shows invalidFileError', async () => {
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      fireEvent.drop(screen.getByTestId('mock-file-input'), {
        dataTransfer: { files: [makeNonPdfFile()] }
      });
      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
      });
    });

    it('dropzone non-PDF drop remounts FileUpload to hide clear/upload controls', async () => {
      const FileUploadMock = (await import('@ska-telescope/ska-gui-components')).FileUpload as any;
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      const callsAfterRender = FileUploadMock.mock.calls.length;

      fireEvent.drop(screen.getByTestId('mock-file-input'), {
        dataTransfer: { files: [makeNonPdfFile()] }
      });

      await waitFor(() => {
        expect(screen.getByText('pdfUpload.science.invalidFileError')).toBeInTheDocument();
        expect(FileUploadMock.mock.calls.length).toBeGreaterThan(callsAfterRender);
      });
    });

    it('FileUpload is remounted when file is rejected via setFile, clearing the filename', async () => {
      const FileUploadMock = (await import('@ska-telescope/ska-gui-components')).FileUpload as any;
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);
      const callsAfterRender = FileUploadMock.mock.calls.length;

      const file = makeFile('too-big.pdf', 100 * 1024 * 1024 + 1);
      await act(async () => {
        capturedSetFile!(file);
      });

      await waitFor(() => {
        // key change triggers a re-mount; the mock must have been called again
        expect(FileUploadMock.mock.calls.length).toBeGreaterThan(callsAfterRender);
      });
    });

    it('FileUpload is remounted when clear is triggered via setFile, clearing the filename', async () => {
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      const FileUploadMock = (await import('@ska-telescope/ska-gui-components')).FileUpload as any;
      wrapper(<SciencePage />);
      const callsAfterRender = FileUploadMock.mock.calls.length;

      act(() => {
        capturedSetFile!('');
      });

      await waitFor(() => {
        expect(FileUploadMock.mock.calls.length).toBeGreaterThan(callsAfterRender);
      });
      // originalFile (the `file` prop) must be cleared, otherwise the dropzone
      // re-renders the cleared filename after the remount.
      expect(capturedFile).toBeNull();
    });

    it('setFile validation path is ignored while an uploaded PDF exists', async () => {
      wrapper(<SciencePage />);

      act(() => {
        capturedSetFile!(makeNonPdfFile());
      });
      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.invalidFileError')).not.toBeInTheDocument();
      });

      act(() => {
        capturedSetFile!('');
      });

      await waitFor(() => {
        expect(screen.queryByText('pdfUpload.science.invalidFileError')).not.toBeInTheDocument();
      });
      expect(mockStore.updateAppContent2).not.toHaveBeenCalledWith(
        expect.objectContaining({ sciencePDF: null })
      );
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

    it('upload proceeds when a valid file is uploaded after a previous error', async () => {
      mockGetPdfPageCount.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
      mockStore.application.content2 = { ...mockProposal, sciencePDF: null };
      wrapper(<SciencePage />);

      const badFile = makeFile('bad.pdf');
      await act(async () => {
        await capturedUploadFunction!(badFile);
      });

      const goodFile = makeFile('good.pdf');
      await act(async () => {
        await capturedUploadFunction!(goodFile);
      });

      expect(GetPresignedUploadUrl).toHaveBeenCalled();
    });
  });
});
