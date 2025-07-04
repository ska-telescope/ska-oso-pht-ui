import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { GetMockPanelList, getUniqueMostRecentPanels } from './getPanelList';
import { MockPanelBackendList } from './mockPanelBackendList';
import * as CONSTANTS from '@/utils/constants';
import { Panel, PanelBackend } from '@/utils/types/panel';
import { MockPanelFrontendList } from './mockPanelFrontendList';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('sorts by latest updated and removes duplicates', () => {
    const result: PanelBackend[] = getUniqueMostRecentPanels(MockPanelBackendList);
    expect(result).to.have.lengthOf(MockPanelBackendList.length - 1);
    expect(result[0].metadata?.last_modified_on).to.equal('2025-07-04T16:20:37.088Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2025-07-03T16:20:37.088Z');
  });

  test('GetMockPanelList returns mock panel list', () => {
    const result = GetMockPanelList();
    expect(result).to.have.lengthOf(MockPanelFrontendList.length);
    expect(result).to.deep.equal(MockPanelFrontendList);
  });

  /*
  test('mappingList returns mapped proposal list from backend to frontend format', () => {
    const proposalFrontEnd: Proposal[] = mappingList(MockProposalBackendList);
    expect(proposalFrontEnd).to.deep.equal(MockProposalFrontendList);
  });
*/
});

/*
describe('GetProposalList Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetProposalList();
    expect(result).toEqual(MockProposalFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockProposalBackendList });
    const result = (await GetProposalList()) as Proposal[];
    expect(result).to.deep.equal(MockProposalFrontendList);
  });

  test('returns unsorted data when API returns only one proposal', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: [MockProposalBackendList[0]] });
    const result = await GetProposalList();
    expect(result).toEqual([MockProposalFrontendList[0]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetProposalList();
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetProposalList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetProposalList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
*/
