import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { MockProposalFrontend } from '@services/axios/get/getProposal/mockProposalFrontend.tsx';
import * as CONSTANTS from '@utils/constants.ts';
import PostProposalValidate, { postMockProposalValidate } from './postProposalValidate.tsx';

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('postMockProposalValidate returns success message', () => {
    const result = postMockProposalValidate();
    expect(result).to.deep.equal({ valid: 'success' });
  });
});

describe('PostProposalValidate Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      post: vi.fn()
    };
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).toEqual({ valid: 'success' });
  });

  test('returns confirmation when USE_LOCAL_DATA is false and data valid', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ data: { result: true, validation_errors: [] } });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ valid: 'success' });
  });

  test('returns validation error when USE_LOCAL_DATA is false and validation fails', async () => {
    const errorList = ['This proposal has no observation sets'];
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({
      data: { result: false, validation_errors: errorList }
    });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: errorList });
  });

  test('returns error when USE_LOCAL_DATA is false and typeof validateResponseData undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ result: undefined });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: ['error.API_UNKNOWN_ERROR'] });
  });

  test('returns validation error when USE_LOCAL_DATA is false and response unexpected format', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockResolvedValue({ result: 'some unexpected format' });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).to.toStrictEqual({ error: ['error.API_UNKNOWN_ERROR'] });
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).toStrictEqual({ error: ['Network Error'] });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.post.mockRejectedValue({ response: { data: { title: 'this is an error' } } });
    const result = await PostProposalValidate(mockedAuthClient, MockProposalFrontend);
    expect(result).toStrictEqual({ error: ['this is an error'] });
  });
});
