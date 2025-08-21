import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@utils/constants.ts';
import { Panel, PanelBackend } from '@utils/types/panel.tsx';
import { getUniqueMostRecentItems } from '@utils/helpers.ts';
import GetPanelList, { GetMockPanelList, mappingList } from './getPanelList.tsx';
import { MockPanelBackendList } from './mockPanelBackendList.tsx';
import { MockPanelFrontendList } from './mockPanelFrontendList.tsx';

describe('Helper Functions', () => {
  test('sorts by latest updated and removes duplicates', () => {
    const result: PanelBackend[] = getUniqueMostRecentItems(MockPanelBackendList, 'panel_id');
    expect(result).to.have.lengthOf(MockPanelBackendList.length - 2);
    expect(result[0].metadata?.last_modified_on).to.equal('2025-07-04T16:20:37.088Z');
    expect(result[1].metadata?.last_modified_on).to.equal('2025-07-03T16:20:37.088Z');
  });

  test('GetMockPanelList returns mock panel list', () => {
    const result = GetMockPanelList();
    expect(result).to.have.lengthOf(MockPanelFrontendList.length);
    expect(result).to.deep.equal(MockPanelFrontendList);
  });

  test('GetMockPanelList with 1 panel returns mock panel list without sorting', () => {
    const result = GetMockPanelList([MockPanelBackendList[2]]);
    expect(result).to.have.lengthOf(1);
    expect(result).to.deep.equal([MockPanelFrontendList[2]]);
  });

  test('mappingList returns mapped proposal list from panel from backend to frontend format', () => {
    const panelListFrontEnd: Panel[] = mappingList(MockPanelBackendList);
    // checking the second element to ignore duplicates as mapping alone will not remove it
    expect(panelListFrontEnd[1]).to.deep.equal(MockPanelFrontendList[1]);
  });

  test('mappingList returns mapped reviewer list from panel from backend to frontend format', () => {
    const panelListFrontEnd: Panel[] = mappingList(MockPanelBackendList);
    // checking the last element to ignore duplicates as mapping alone will not remove it
    expect(panelListFrontEnd[MockPanelBackendList.length - 1]).to.deep.equal(
      MockPanelFrontendList[MockPanelFrontendList.length - 1]
    );
  });
});

describe('GetPanelList Service', () => {
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
    const result = await GetPanelList(mockedAuthClient);
    expect(result).toEqual(MockPanelFrontendList);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockPanelBackendList });
    const result = (await GetPanelList(mockedAuthClient)) as Panel[];
    expect(result).to.deep.equal(MockPanelFrontendList);
  });

  test('returns unsorted data when API returns only one panel', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: [MockPanelBackendList[1]] });
    const result = await GetPanelList(mockedAuthClient);
    expect(result).toEqual([MockPanelFrontendList[1]]);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetPanelList(mockedAuthClient);
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetPanelList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API returns non-array data', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: { not: 'an array' } });
    const result = await GetPanelList(mockedAuthClient);
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
