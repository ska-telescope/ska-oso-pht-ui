import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { MockProposalFrontend } from '@services/axios/get/getProposal/mockProposalFrontend.tsx';
import PostProposalValidate from './postProposalValidate.tsx';

describe('PostProposalValidate Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns confirmation when data valid', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: { result: true, validation_errors: [] } });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ valid: 'success' });
  });

  test('returns validation error when validation fails', async () => {
    const errorList = ['This proposal has no observation sets'];
    mockedAuthClient.post.mockResolvedValue({
      data: { result: false, validation_errors: errorList }
    });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: errorList });
  });

  test('returns error when typeof validateResponseData undefined', async () => {
    mockedAuthClient.post.mockResolvedValue({ result: undefined });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: ['error.API_UNKNOWN_ERROR'] });
  });

  test('returns validation error when response unexpected format', async () => {
    mockedAuthClient.post.mockResolvedValue({ result: 'some unexpected format' });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: ['error.API_UNKNOWN_ERROR'] });
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).toStrictEqual({ error: ['Network Error'] });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ response: { data: { title: 'this is an error' } } });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).toStrictEqual({ error: ['this is an error'] });
  });
});
