import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MockProposalFrontend } from '../getProposal/mockProposalFrontend';
import { MockProposalBackend } from '../getProposal/mockProposalBackend';
import PostProposal, { mappingPostProposal, mockPostProposal } from './postProposal';
import { mockPutProposal } from './putProposal';
import MappingPutProposal from './putProposalMapping';
import { ProposalBackend } from '@/utils/types/proposal';
import { PROPOSAL_STATUS } from '@/utils/constants';
import * as CONSTANTS from '@/utils/constants';

vi.mock('axiosAuthClient');
const mockedAxios = (axios as unknown) as {
  post: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  test('mockPutProposal returns mock id', () => {
    const result = mockPutProposal();
    expect(result).to.deep.equal({ valid: 'success' });
  });

  test('mappingPutProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = MappingPutProposal(proposal, PROPOSAL_STATUS.DRAFT);
    expect(proposalBackEnd).to.deep.equal({
      ...MockProposalBackend,
      info: {
        ...MockProposalBackend.info,
        proposal_type: { ...MockProposalBackend.info.proposal_type, attributes: [] }
      }
    });
  });
});
/*
describe('PostProposal Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toEqual('PROPOSAL-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue({ data: MockProposalBackend.prsl_id });
    const result = (await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT)) as string;
    expect(result).to.deep.equal(MockProposalBackend.prsl_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(undefined);
    const result = await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(null);
    const result = await PostProposal(MockProposalFrontend, PROPOSAL_STATUS.DRAFT);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
*/
