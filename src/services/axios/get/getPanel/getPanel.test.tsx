import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import * as CONSTANTS from '@utils/constants.ts';
import { Panel, PanelBackend } from '@utils/types/panel.tsx';
import { GetMockPanel, mapping } from './getPanel.tsx';
import { MockPanelBackend } from './mockPanelBackend.tsx';
import { MockPanelFrontend } from './mockPanelFrontEnd.tsx';
import GetPanel from './getPanel.tsx';

describe('Helper Functions', () => {
  test('GetMockPanel returns mock panel', () => {
    const result = GetMockPanel();
    expect(result).to.deep.equal(MockPanelFrontend);
  });

  test('mapping returns mapped panel from backend to frontend format with proposals and reviewers', () => {
    const panelFrontEnd: Panel = mapping(MockPanelBackend);
    expect(panelFrontEnd).to.deep.equal(MockPanelFrontend);
  });

  test('mapping returns mapped panel from backend to frontend format with no proposals and reviewers', () => {
    const backendPanel: PanelBackend = {
      ...MockPanelBackend,
      proposals: [],
      sci_reviewers: [],
      tech_reviewers: []
    };
    const panelFrontEnd: Panel = mapping(backendPanel);
    expect(panelFrontEnd).to.deep.equal({
      ...MockPanelFrontend,
      proposals: [],
      sciReviewers: [],
      tecReviewers: []
    });
  });
});

describe('GetPanel Service', () => {
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
    const result = await GetPanel(mockedAuthClient, 'dummy_id');
    expect(result).toEqual(MockPanelFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({ data: MockPanelBackend });
    const result = (await GetPanel(mockedAuthClient, 'dummy_id')) as Panel;
    expect(result).to.deep.equal(MockPanelFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await GetPanel(mockedAuthClient, 'dummy_id');
    expect(result).toBe('Network Error');
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await GetPanel(mockedAuthClient, 'dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.get.mockResolvedValue({});
    const result = await GetPanel(mockedAuthClient, 'dummy_id');
    expect(result).toBe('error.API_UNKNOWN_ERROR');
  });
});
