import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend.tsx';
import * as CONSTANTS from '@utils/constants.ts';
import { PanelDecision } from '@utils/types/panelDecision.tsx';
import getPanelDecisionList, {
  getMockPanelDecision,
  mappingList
} from './getPanelDecisionList.tsx';
import { MockPanelDecisionFrontendList } from './mockPanelDecisionFrontendList.tsx';
import { MockPanelDecisionBackendList } from './mockPanelDecisionBackendList.tsx';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('getPanelDecisionList returns mock panel list', () => {
    const result = getMockPanelDecision(cycleId);
    expect(result).to.have.lengthOf(MockPanelDecisionFrontendList.length);
    expect(result).to.deep.equal(MockPanelDecisionFrontendList);
  });

  test('mappingList returns mapped panel decision list from backend to frontend format', () => {
    const panelDecisionListFrontEnd: PanelDecision[] = mappingList(
      MockPanelDecisionBackendList,
      cycleId
    );
    // checking the second element to ignore duplicates as mapping alone will not remove it
    expect(panelDecisionListFrontEnd[1]).to.deep.equal(MockPanelDecisionFrontendList[1]);
  });
});

describe('getPanelDecisionList Service', () => {
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
    const result = await getPanelDecisionList(mockedAuthClient, cycleId);
    expect(result).toEqual(MockPanelDecisionFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockPanelDecisionBackendList });
    const result = (await getPanelDecisionList(mockedAuthClient, cycleId)) as PanelDecision[];
    expect(result).to.deep.equal(MockPanelDecisionFrontendList);
  });

  test('returns unsorted data when API returns only one panel', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockPanelDecisionBackendList[1]] });
    const result = await getPanelDecisionList(mockedAuthClient, cycleId);
    expect(result).toEqual([MockPanelDecisionFrontendList[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await getPanelDecisionList(mockedAuthClient, cycleId);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await getPanelDecisionList(mockedAuthClient, cycleId);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await getPanelDecisionList(mockedAuthClient, cycleId);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
