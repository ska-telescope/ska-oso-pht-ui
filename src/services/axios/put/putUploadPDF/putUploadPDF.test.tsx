import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClientPDF from '../../axiosClientPDF/axiosClientPDF';
import PutUploadPDF from './putUploadPDF';

vi.mock('../../axiosClientPDF/axiosClientPDF', () => ({
  default: {
    put: vi.fn()
  }
}));

describe('PutUploadPDF', () => {
  const signedUrl = 'https://s3.amazonaws.com/fake-signed-url';
  const selectedFile = new Blob(['dummy content'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns result.data when axiosClientPDF.put succeeds', async () => {
    (axiosClientPDF.put as any).mockResolvedValue({ data: 'success' });

    const result = await PutUploadPDF(signedUrl, selectedFile);
    expect(result).toBe('success');
  });

  it('returns API_UNKNOWN_ERROR when axiosClientPDF.put returns undefined', async () => {
    (axiosClientPDF.put as any).mockResolvedValue(undefined);

    const result = await PutUploadPDF(signedUrl, selectedFile);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when axiosClientPDF.put throws an Error', async () => {
    (axiosClientPDF.put as any).mockRejectedValue(new Error('Upload failed'));

    const result = await PutUploadPDF(signedUrl, selectedFile);
    expect(result).toEqual({ error: 'Upload failed' });
  });

  it('returns generic error when axiosClientPDF.put throws non-Error', async () => {
    (axiosClientPDF.put as any).mockRejectedValue('some string');

    const result = await PutUploadPDF(signedUrl, selectedFile);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
