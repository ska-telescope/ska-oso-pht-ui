import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { mockObservatoryDataFrontend } from '@services/axios/getObservatoryData/mockObservatoryDataFrontend.tsx';
import PostProposalReview, {
  mappingReviewFrontendToBackend,
  postMockProposalReview
} from './postProposalReview';
import {
  MockProposalReviewFrontend,
  MockProposalTechnicalReviewFrontend
} from './mockProposalReviewFrontend';
import {
  MockProposalReviewBackend,
  MockProposalTechnicalReviewBackend
} from './mockProposalReviewBackend';
import { ProposalReviewBackend } from '@/utils/types/proposalReview';
import * as CONSTANTS from '@/utils/constants';

const cycleId = mockObservatoryDataFrontend.observatoryPolicy.cycleInformation.cycleId;

vi.mock('axiosAuthClient');
const mockedAxios = (axios as unknown) as {
  post: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('postMockProposalReview returns mock id', () => {
    const result = postMockProposalReview();
    expect(result).to.equal('PROPOSAL-REVIEW-ID-001');
  });

  test('mappingReviewFrontendToBackend returns mapped review from frontend to backend format', () => {
    const reviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      MockProposalReviewFrontend,
      cycleId,
      true
    );
    expect(reviewBackEnd).to.deep.equal(MockProposalReviewBackend);
  });

  test('mappingReviewFrontendToBackend returns mapped technical review from frontend to backend format', () => {
    const technicalReviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      MockProposalTechnicalReviewFrontend,
      cycleId,
      true
    );
    expect(technicalReviewBackEnd).to.deep.equal(MockProposalTechnicalReviewBackend);
  });

  test('mappingReviewFrontendToBackend generates cycle id when not provided', () => {
    const reviewBackEnd: ProposalReviewBackend = mappingReviewFrontendToBackend(
      {
        ...MockProposalReviewFrontend,
        cycle: ''
      },
      cycleId,
      true
    );
    expect(reviewBackEnd).to.deep.equal({
      ...MockProposalReviewBackend,
      cycle: 'SKAO_2027_1'
    });
  });
});

describe('PostProposalReview Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostProposalReview(MockProposalReviewFrontend, cycleId);
    expect(result).toEqual('PROPOSAL-REVIEW-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue({ data: MockProposalReviewBackend.review_id });
    const result = (await PostProposalReview(MockProposalReviewFrontend, cycleId)) as string;
    expect(result).to.deep.equal(MockProposalReviewBackend.review_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposalReview(MockProposalReviewFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposalReview(MockProposalReviewFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(undefined);
    const result = await PostProposalReview(MockProposalReviewFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(null);
    const result = await PostProposalReview(MockProposalReviewFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
