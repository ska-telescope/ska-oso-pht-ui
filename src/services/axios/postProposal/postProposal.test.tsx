import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import PostProposal, { mappingPostProposal, mockPostProposal } from './postProposal';
import { MockProposalFrontend } from './mockProposalFrontend';
import { MockProposalBackend } from './mockProposalBackend';
import { ProposalBackend } from '@/utils/types/proposal';
import { PROPOSAL_STATUS } from '@/utils/constants';
import { fetchCycleData } from '@/utils/storage/cycleData';
import * as CONSTANTS from '@/utils/constants';

vi.mock('axiosAuthClient');
const mockedAxios = (axios as unknown) as {
  post: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  test('mockPostProposal returns mock id', () => {
    const result = mockPostProposal();
    expect(result).to.equal('PROPOSAL-ID-001');
  });

  test('mappingPostProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = mappingPostProposal(
      MockProposalFrontend,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test('mappingPostProposal generates cycle when not provided', () => {
    const myProposal = { ...MockProposalFrontend, cycle: null };
    const proposalBackend: ProposalBackend = mappingPostProposal(myProposal, PROPOSAL_STATUS.DRAFT);
    const expectedProposalBackend = { ...MockProposalBackend, cycle: fetchCycleData().id };
    expect(proposalBackend).to.deep.equal(expectedProposalBackend);
  });

  test('mappingPostProposal set abstract to null when not provided', () => {
    const myProposal = { ...MockProposalFrontend, abstract: null };
    const proposalBackend: ProposalBackend = mappingPostProposal(myProposal, PROPOSAL_STATUS.DRAFT);
    const expected: ProposalBackend = MockProposalBackend;
    const info = expected.info;
    delete info?.abstract;
    // const expectedProposalBackend = { ...MockProposalBackend, info: { ...MockProposalBackend.info, abstract: null } };
    expect(proposalBackend).to.deep.equal(expected);
  });
});

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
