import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import GetPanelList, {
  GetMockPanelList,
  getUniqueMostRecentPanels,
  mappingList
} from './getPanelList';
import { MockPanelBackendList } from './mockPanelBackendList';
import { MockPanelFrontendList } from './mockPanelFrontendList';
import * as CONSTANTS from '@/utils/constants';
import { Panel, PanelBackend } from '@/utils/types/panel';

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

  test('mappingList returns mapped proposal list from backend to frontend format', () => {
    const panelListFrontEnd: Panel[] = mappingList(MockPanelBackendList);
    // checking the second element to ignore duplicates as mapping alone will not remove it
    expect(panelListFrontEnd[1]).to.deep.equal(MockPanelFrontendList[1]);
  });
});

describe('GetProposalList Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetPanelList();
    expect(result).toEqual(MockPanelFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockPanelBackendList });
    const result = (await GetPanelList()) as Panel[];
    expect(result).to.deep.equal(MockPanelFrontendList);
  });

  test('returns unsorted data when API returns only one panel', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: [MockPanelBackendList[1]] });
    const result = await GetPanelList();
    expect(result).toEqual([MockPanelFrontendList[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetPanelList();
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetPanelList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetPanelList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
