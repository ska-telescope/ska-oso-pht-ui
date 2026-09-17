import { describe, it, expect, vi, beforeEach } from 'vitest';
import axiosClient from '../../axiosClient/axiosClient';
import DeletePDF from './deletePDF';

vi.mock('../../axiosClient/axiosClient', () => ({
  default: {
    delete: vi.fn()
  }
}));

let mockedAxiosClient: any;

beforeEach(() => {
  vi.resetAllMocks();
  mockedAxiosClient = axiosClient;
});

describe('DeletePDF', () => {
  const signedUrl = 'https://s3.amazonaws.com/fake-delete-url';

  it('returns result.data when delete succeeds with status 204', async () => {
    mockedAxiosClient.delete.mockResolvedValue({ status: 204, data: 'delete-success' });

    const result = await DeletePDF(signedUrl);
    expect(result).toBe('delete-success');
  });

  it('returns API_UNKNOWN_ERROR when delete returns undefined', async () => {
    mockedAxiosClient.delete.mockResolvedValue(undefined);

    const result = await DeletePDF(signedUrl);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns API_UNKNOWN_ERROR when delete returns non-204 status', async () => {
    mockedAxiosClient.delete.mockResolvedValue({ status: 200, data: 'unexpected' });

    const result = await DeletePDF(signedUrl);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  it('returns error message when delete throws an Error', async () => {
    mockedAxiosClient.delete.mockRejectedValue(new Error('Delete failed'));

    const result = await DeletePDF(signedUrl);
    expect(result).toEqual({ error: 'Delete failed' });
  });

  it('returns generic error when delete throws non-Error', async () => {
    mockedAxiosClient.delete.mockRejectedValue('unexpected string');

    const result = await DeletePDF(signedUrl);
    expect(result).toEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
