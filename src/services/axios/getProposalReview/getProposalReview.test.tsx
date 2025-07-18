import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MockProposalReviewFrontend } from '../postProposalReview.tsx/mockProposalReviewFrontend';
import { MockProposalReviewBackend } from '../postProposalReview.tsx/mockProposalReviewBackend';
import { mappingReviewBackendToFrontend } from '../putProposalReview/putProposalReview';
import GetProposalReview, { GetMockReview } from './getProposalReview';
import { ProposalReview } from '@/utils/types/proposalReview';
import * as CONSTANTS from '@/utils/constants';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('GetMockReview returns mock review', () => {
    const result = GetMockReview();
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('mapping returns mapped review from backend to frontend format', () => {
    const proposalReviewFrontEnd: ProposalReview = mappingReviewBackendToFrontend(
      MockProposalReviewBackend
    );
    expect(proposalReviewFrontEnd).to.deep.equal(MockProposalReviewFrontend);
  });
});

describe('GetProposalReview Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalReview('dummy_id');
    expect(result).toEqual(MockProposalReviewFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockProposalReviewBackend });
    const result = (await GetProposalReview('dummy_id')) as ProposalReview;
    expect(result).to.deep.equal(MockProposalReviewFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalReview('dummy_id');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalReview('dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({});
    const result = await GetProposalReview('dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
