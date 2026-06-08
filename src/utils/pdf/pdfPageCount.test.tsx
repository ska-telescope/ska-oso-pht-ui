import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./pdfSetup', () => ({
  pdfjs: {
    getDocument: vi.fn()
  }
}));

import { getPdfPageCount } from './pdfPageCount';
import { pdfjs } from './pdfSetup';

const mockGetDocument = pdfjs.getDocument as ReturnType<typeof vi.fn>;

describe('getPdfPageCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct page count for a valid PDF', async () => {
    const mockDestroy = vi.fn().mockResolvedValue(undefined);
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({ numPages: 3, destroy: mockDestroy })
    });

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    const count = await getPdfPageCount(file);

    expect(count).toBe(3);
  });

  it('awaits and verifies that doc.destroy() was called', async () => {
    const mockDestroy = vi.fn().mockResolvedValue(undefined);
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({ numPages: 1, destroy: mockDestroy })
    });

    const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
    await getPdfPageCount(file);

    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it('rejects for an unreadable or encrypted file', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.reject(new Error('Invalid PDF structure'))
    });

    const file = new File(['not a pdf'], 'bad.pdf', { type: 'application/pdf' });
    await expect(getPdfPageCount(file)).rejects.toThrow();
  });
});
