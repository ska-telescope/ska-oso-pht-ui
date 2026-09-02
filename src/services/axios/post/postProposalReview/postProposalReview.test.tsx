import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PostProposalReview, { mappingReviewFrontendToBackend } from './postProposalReview';
import {
  MockProposalScienceReviewExcludedFrontend,
  MockProposalScienceReviewFrontend,
  MockProposalTechnicalReviewFrontend
} from './mockProposalReviewFrontend';
import {
  MockProposalScienceReviewBackend,
  MockProposalScienceReviewExcludedBackend,
  MockProposalTechnicalReviewBackend
} from './mockProposalReviewBackend';
import { MockObservatoryDataFrontend } from '@/services/axios/get/getObservatoryData/mockObservatoryDataFrontend';
import { ProposalReviewBackend } from '@/utils/types/proposalReview';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('mappingReviewFrontendToBackend returns mapped review from frontend to backend format', () => {
    const reviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      MockProposalScienceReviewFrontend,
      cycleId,
      true
    );
    expect(reviewBackEnd).to.deep.equal(MockProposalScienceReviewBackend);
  });

  test('mappingReviewFrontendToBackend returns mapped review from frontend to backend format CHLOE', () => {
    const reviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      MockProposalScienceReviewExcludedFrontend,
      cycleId,
      true
    );
    expect(reviewBackEnd).to.deep.equal(MockProposalScienceReviewExcludedBackend);
  });

  test('mappingReviewFrontendToBackend returns mapped technical review from frontend to backend format', () => {
    const technicalReviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      MockProposalTechnicalReviewFrontend,
      cycleId,
      true
    );
    expect(technicalReviewBackEnd).to.deep.equal(MockProposalTechnicalReviewBackend);
  });

  /* IMPROVEMENT - Recheck this later
  test('mappingReviewFrontendToBackend generates cycle id when not provided', () => {
    const reviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      {
        ...MockProposalScienceReviewFrontend,
        cycle: ''
      },
      cycleId,
      true
    );
    expect(reviewBackEnd).to.deep.equal({
      ...MockProposalScienceReviewBackend,
      cycle: 'SKAO_2027_1'
    });
  });
  */
});

describe('PostProposalReview Service', () => {
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

  test('returns data id from API', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockProposalScienceReviewBackend.review_id });
    const result = (await PostProposalReview(
      mockedAuthClient,
      MockProposalScienceReviewFrontend,
      cycleId
    )) as string;
    expect(result).to.deep.equal(MockProposalScienceReviewBackend.review_id);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('error.API_UNKNOWN_ERROR'));
    const result = await PostProposalReview(
      mockedAuthClient,
      MockProposalScienceReviewFrontend,
      cycleId
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposalReview(
      mockedAuthClient,
      MockProposalScienceReviewFrontend,
      cycleId
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostProposalReview(
      mockedAuthClient,
      MockProposalScienceReviewFrontend,
      cycleId
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostProposalReview(
      mockedAuthClient,
      MockProposalScienceReviewFrontend,
      cycleId
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
