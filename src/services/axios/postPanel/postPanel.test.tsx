import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import PostPanel, { mappingPostPanel, postMockPanel } from './postPanel';
import { MockPanelFrontend, MockPanelFrontendWithProposals } from './mockPanelFrontend';
import { MockPanelBackend, MockPanelBackendWithProposals } from './mockPanelBackend';
import { PanelBackend } from '@/utils/types/panel';
import * as CONSTANTS from '@/utils/constants';
import { CYCLE } from '@/utils/constants';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('postMockPanel returns mock id', () => {
    const result = postMockPanel();
    expect(result).to.equal('PANEL-ID-001');
  });

  test('mappingPostPanel returns mapped panel from frontend to backend format', () => {
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontend);
    expect(panelBackEnd).to.deep.equal(MockPanelBackend);
  });

  test('mappingPostPanel generates cycle when not provided', () => {
    const myPanel = { ...MockPanelFrontend, cycle: undefined };
    const panelBackEnd: PanelBackend = mappingPostPanel(myPanel);
    const expectedPanelBackend = { ...MockPanelBackend, cycle: CYCLE };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });

  test('mappingPostPanel maps panel with proposals', () => {
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontendWithProposals);
    expect(panelBackEnd).to.deep.equal(MockPanelBackendWithProposals);
  });

  test('mappingPostPanel maps panel with proposals and generate assignedOn date when not provided', () => {
    const today = new Date().toISOString();
    const myPanel = {
      ...MockPanelFrontendWithProposals,
      proposals: [{ ...MockPanelFrontendWithProposals.proposals[0], assignedOn: undefined }]
    };
    const panelBackEnd: PanelBackend = mappingPostPanel(myPanel);
    const expectedPanelBackend = {
      ...MockPanelBackendWithProposals,
      proposals: [
        {
          ...MockPanelBackendWithProposals.proposals[0],
          assigned_on: today
        }
      ]
    };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });
});

describe('PostPanel Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toEqual('PANEL-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue({ data: MockPanelFrontend.id });
    const result = (await PostPanel(MockPanelFrontend)) as string;
    expect(result).to.deep.equal(MockPanelBackend.panel_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(undefined);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(null);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
