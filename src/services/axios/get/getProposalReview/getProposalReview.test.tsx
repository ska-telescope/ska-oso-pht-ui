import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ProposalReview } from '@utils/types/proposalReview.tsx';
import * as CONSTANTS from '@utils/constants.ts';
import { mappingReviewBackendToFrontend } from '@services/axios/put/putProposalReview/putProposalReview.tsx';
import {
  MockProposalScienceReviewBackend,
  MockProposalTechnicalReviewBackend
} from '../../post/postProposalReview/mockProposalReviewBackend.tsx';
import {
  MockProposalScienceReviewFrontend,
  MockProposalTechnicalReviewFrontend
} from '../../post/postProposalReview/mockProposalReviewFrontend.tsx';
import GetProposalReview, { GetMockReview } from './getProposalReview.tsx';

describe('Helper Functions', () => {
  test('GetMockReview returns mock review', () => {
    const result = GetMockReview();
    expect(result).to.deep.equal(MockProposalScienceReviewFrontend);
  });

  test('mapping returns mapped review from backend to frontend format', () => {
    const proposalReviewFrontEnd: ProposalReview = mappingReviewBackendToFrontend(
      MockProposalScienceReviewBackend
    );
    expect(proposalReviewFrontEnd).to.deep.equal(MockProposalScienceReviewFrontend);
  });

  test('mapping returns mapped technical review from backend to frontend format', () => {
    const technicalProposalReviewFrontEnd: ProposalReview = mappingReviewBackendToFrontend(
      MockProposalTechnicalReviewBackend
    );
    expect(technicalProposalReviewFrontEnd).to.deep.equal(MockProposalTechnicalReviewFrontend);
  });
});

describe('GetProposalReview Service', () => {
  let mockedAuthClient: any;
  beforeEach(() => {
    vi.resetAllMocks();
    mockedAuthClient = {
      put: vi.fn(),
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { clear: vi.fn, eject: vi.fn(), use: vi.fn() },
        response: { clear: vi.fn, eject: vi.fn(), use: vi.fn() }
      }
    };
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalReview(mockedAuthClient, 'dummy_id');
    expect(result).toEqual(MockProposalScienceReviewFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockProposalScienceReviewBackend });
    const result = (await GetProposalReview(mockedAuthClient, 'dummy_id')) as ProposalReview;
    expect(result).to.deep.equal(MockProposalScienceReviewFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalReview(mockedAuthClient, 'dummy_id');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalReview(mockedAuthClient, 'dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({});
    const result = await GetProposalReview(mockedAuthClient, 'dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
