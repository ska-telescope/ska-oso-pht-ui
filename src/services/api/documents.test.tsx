import { beforeEach, describe, expect, test, vi } from 'vitest';
import { UNKNOWN_API_ERROR } from './apiResult';
import {
  deleteAtSignedUrl,
  getDeleteUrl,
  getDownloadUrl,
  getUploadUrl,
  uploadToSignedUrl
} from './documents';

// The error handling common to every call is tested with callApi (apiResult.test.tsx)

const { mockUploadUrl, mockDownloadUrl, mockDeleteUrl, mockPut, mockDelete } = vi.hoisted(() => ({
  mockUploadUrl: vi.fn(),
  mockDownloadUrl: vi.fn(),
  mockDeleteUrl: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn()
}));

vi.mock('./client', () => ({
  osoApiBasePath: '',
  api: {
    proposals: {
      createUploadPdfUrlOsoApiV17PhtPrslsSignedUrlUploadFilenamePost: mockUploadUrl,
      createDownloadPdfUrlOsoApiV17PhtPrslsSignedUrlDownloadFilenamePost: mockDownloadUrl,
      createDeletePdfUrlOsoApiV17PhtPrslsSignedUrlDeleteFilenamePost: mockDeleteUrl
    }
  }
}));

// The S3 requests go through an axios instance of their own
vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    ...actual,
    default: { ...actual.default, create: () => ({ put: mockPut, delete: mockDelete }) }
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe.each([
  ['getUploadUrl', getUploadUrl, mockUploadUrl],
  ['getDownloadUrl', getDownloadUrl, mockDownloadUrl],
  ['getDeleteUrl', getDeleteUrl, mockDeleteUrl]
])('%s', (_name, call, mock) => {
  test('returns the signed URL for the file', async () => {
    mock.mockResolvedValue({ data: 'https://signed-url' });

    await expect(call('prsl-1-science.pdf')).resolves.toEqual({ data: 'https://signed-url' });
    expect(mock).toHaveBeenCalledExactlyOnceWith('prsl-1-science.pdf');
  });

  test('returns the error from a failed request', async () => {
    mock.mockRejectedValue(new Error('Network Error'));
    await expect(call('prsl-1-science.pdf')).resolves.toEqual({ error: 'Network Error' });
  });
});

describe('uploadToSignedUrl', () => {
  const file = new Blob(['%PDF']);

  test('puts the file to the signed URL', async () => {
    mockPut.mockResolvedValue({ status: 200, data: '' });

    await expect(uploadToSignedUrl('https://signed-url', file)).resolves.toEqual({
      data: undefined
    });
    expect(mockPut).toHaveBeenCalledExactlyOnceWith('https://signed-url', file);
  });

  test('returns the error from a failed upload', async () => {
    mockPut.mockRejectedValue(new Error('Network Error'));
    await expect(uploadToSignedUrl('https://signed-url', file)).resolves.toEqual({
      error: 'Network Error'
    });
  });
});

describe('deleteAtSignedUrl', () => {
  test('deletes the file at the signed URL', async () => {
    mockDelete.mockResolvedValue({ status: 204, data: '' });

    await expect(deleteAtSignedUrl('https://signed-url')).resolves.toEqual({ data: undefined });
    expect(mockDelete).toHaveBeenCalledExactlyOnceWith('https://signed-url');
  });

  test('returns the standard error when S3 does not confirm the delete with 204', async () => {
    mockDelete.mockResolvedValue({ status: 200, data: '' });
    await expect(deleteAtSignedUrl('https://signed-url')).resolves.toEqual({
      error: UNKNOWN_API_ERROR
    });
  });
});
