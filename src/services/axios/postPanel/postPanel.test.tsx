import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { mockCycleDataFrontend } from '../getCycleData/mockCycleDataFrontend';
import { MockStore, StoreType } from '../MockStore';
import PostPanel, { mappingPostPanel, postMockPanel } from './postPanel';
import {
  MockPanelFrontend,
  MockPanelFrontendWithProposals,
  MockPanelFrontendWithReviewers
} from './mockPanelFrontend';
import {
  MockPanelBackend,
  MockPanelBackendWithProposals,
  MockPanelBackendWithReviewers
} from './mockPanelBackend';
import { PanelBackend } from '@/utils/types/panel';
import * as CONSTANTS from '@/utils/constants';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  post: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
  test('postMockPanel returns mock id', () => {
    const result = postMockPanel();
    expect(result).to.equal('PANEL-ID-001');
  });

  test('mappingPostPanel returns mapped panel from frontend to backend format', () => {
    // TODO mock cycle data
    // vi.spyOn(getCycleData(), 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontend);
    expect(panelBackEnd).to.deep.equal(MockPanelBackend);
  });

  test('mappingPostPanel generates cycle when not provided', () => {
    const myPanel = { ...MockPanelFrontend, cycle: undefined };
    const panelBackEnd: PanelBackend = mappingPostPanel(myPanel);
    const expectedPanelBackend = {
      ...MockPanelBackend,
      cycle: mockCycleDataFrontend.observatoryPolicy.cycleInformation.cycleId
    };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });

  test('mappingPostPanel maps panel with proposals', () => {
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontendWithProposals);
    expect(panelBackEnd).to.deep.equal(MockPanelBackendWithProposals);
  });

  test('mappingPostPanel maps panel with proposals and generate assignedOn date when not provided', () => {
    const today = new Date();
    const myPanel = {
      ...MockPanelFrontendWithProposals,
      proposals: [{ ...MockPanelFrontendWithProposals.proposals[0], assignedOn: undefined }]
    };
    const expectedPanelBackend: PanelBackend = mappingPostPanel(myPanel);
    expect(
      new Date(expectedPanelBackend.proposals[0].assigned_on as string).getTime()
    ).to.be.closeTo(today.getTime(), 10); // 10ms tolerance
  });

  test('mappingPostPanel maps panel with reviewers', () => {
    const panelBackEnd: PanelBackend = mappingPostPanel(MockPanelFrontendWithReviewers);
    expect(panelBackEnd).to.deep.equal(MockPanelBackendWithReviewers);
  });

  test('mappingPostPanel maps panel with reviewers and generate assignedOn date when not provided', () => {
    const today = new Date();
    const myPanel = {
      ...MockPanelFrontendWithReviewers,
      reviewers: [{ ...MockPanelFrontendWithReviewers.reviewers[0], assignedOn: undefined }]
    };
    const expectedPanelBackend: PanelBackend = mappingPostPanel(myPanel);
    expect(
      new Date(expectedPanelBackend.reviewers[0].assigned_on as string).getTime()
    ).to.be.closeTo(today.getTime(), 10); // 10ms tolerance
  });
});

describe('PostPanel Service', () => {
  beforeEach(() => {
    // vi.resetAllMocks();
    vi.clearAllMocks();
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toEqual('PANEL-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
    mockedAxios.post.mockResolvedValue({ data: MockPanelFrontend.id });
    const result = (await PostPanel(MockPanelFrontend)) as string;
    expect(result).to.deep.equal(MockPanelBackend.panel_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
    mockedAxios.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
    mockedAxios.post.mockResolvedValue(undefined);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
    mockedAxios.post.mockResolvedValue(null);
    const result = await PostPanel(MockPanelFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
