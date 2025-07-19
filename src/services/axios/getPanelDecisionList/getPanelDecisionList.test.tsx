import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import getPanelDecisionList, { getMockPanelDecision, mappingList } from './getPanelDecisionList';
import { MockPanelDecisionFrontendList } from './mockPanelDecisionFrontendList';
import { MockPanelDecisionBackendList } from './mockPanelDecisionBackendList';
import * as CONSTANTS from '@/utils/constants';
import { PanelDecision } from '@/utils/types/panelDecision';

const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('getPanelDecisionList returns mock panel list', () => {
    const result = getMockPanelDecision();
    expect(result).to.have.lengthOf(MockPanelDecisionFrontendList.length);
    expect(result).to.deep.equal(MockPanelDecisionFrontendList);
  });

  test('mappingList returns mapped panel decision list from backend to frontend format', () => {
    const panelDecisionListFrontEnd: PanelDecision[] = mappingList(MockPanelDecisionBackendList);
    // checking the second element to ignore duplicates as mapping alone will not remove it
    expect(panelDecisionListFrontEnd[1]).to.deep.equal(MockPanelDecisionFrontendList[1]);
  });
});

describe('getPanelDecisionList Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await getPanelDecisionList();
    expect(result).toEqual(MockPanelDecisionFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockPanelDecisionBackendList });
    const result = (await getPanelDecisionList()) as PanelDecision[];
    expect(result).to.deep.equal(MockPanelDecisionFrontendList);
  });

  test('returns unsorted data when API returns only one panel', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: [MockPanelDecisionBackendList[1]] });
    const result = await getPanelDecisionList();
    expect(result).toEqual([MockPanelDecisionFrontendList[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await getPanelDecisionList();
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await getPanelDecisionList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await getPanelDecisionList();
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
