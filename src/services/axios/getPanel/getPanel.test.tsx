import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { GetMockPanel, mapping } from './getPanel';
import { MockPanelBackend } from './mockPanelBackend';
import { MockPanelFrontend } from './mockPanelFrontEnd';
import GetPanel from './getPanel';
import * as CONSTANTS from '@/utils/constants';
import { Panel, PanelBackend } from '@/utils/types/panel';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('GetMockPanel returns mock panel', () => {
    const result = GetMockPanel();
    expect(result).to.deep.equal(MockPanelFrontend);
  });

  test('mapping returns mapped panel from backend to frontend format with proposals and reviewers', () => {
    const panelListFrontEnd: Panel = mapping(MockPanelBackend);
    expect(panelListFrontEnd).to.deep.equal(MockPanelFrontend);
  });

  test('mapping returns mapped panel from backend to frontend format with no proposals and reviewers', () => {
    const backendPanel: PanelBackend = { ...MockPanelBackend, proposals: [], reviewers: [] };
    const panelListFrontEnd: Panel = mapping(backendPanel);
    expect(panelListFrontEnd).to.deep.equal({ ...MockPanelFrontend, proposals: [], reviewers: [] });
  });
});

describe('GetProposalList Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await GetPanel('dummy_id');
    expect(result).toEqual(MockPanelFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockPanelBackend });
    const result = (await GetPanel('dummy_id')) as Panel;
    expect(result).to.deep.equal(MockPanelFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetPanel('dummy_id');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetPanel('dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({});
    const result = await GetPanel('dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
