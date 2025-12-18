import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import PutPanel, { mappingPutPanel, putMockPanel } from './putPanel';
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
import { MockObservatoryDataFrontend } from '@/services/axios/get/getObservatoryData/mockObservatoryDataFrontend';
import { PanelBackend } from '@/utils/types/panel';
import * as CONSTANTS from '@/utils/constants';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('putMockPanel returns mock id', () => {
    const result = putMockPanel();
    expect(result).to.equal('PANEL-ID-001');
  });

  test('mappingPutPanel returns mapped panel from frontend to backend format', () => {
    const panelBackEnd: PanelBackend = mappingPutPanel(MockPanelFrontend, cycleId);
    expect(panelBackEnd).to.deep.equal(MockPanelBackend);
  });

  test('mappingPutPanel generates cycle when not provided', () => {
    const myPanel = { ...MockPanelFrontend, cycle: undefined };
    const panelBackEnd: PanelBackend = mappingPutPanel(myPanel, cycleId);
    const expectedPanelBackend = {
      ...MockPanelBackend,
      cycle: cycleId
    };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });

  test('mappingPutPanel maps panel with proposals', () => {
    const panelBackEnd: PanelBackend = mappingPutPanel(MockPanelFrontendWithProposals, cycleId);
    expect(panelBackEnd).to.deep.equal(MockPanelBackendWithProposals);
  });

  test('mappingPutPanel maps panel with proposals and generate assignedOn date when not provided', () => {
    const today = new Date();
    const myPanel = {
      ...MockPanelFrontendWithProposals,
      proposals: [{ ...MockPanelFrontendWithProposals.proposals[0], assignedOn: undefined }]
    };
    const expectedPanelBackend: PanelBackend = mappingPutPanel(myPanel, cycleId);
    expect(
      new Date(expectedPanelBackend.proposals[0].assigned_on as string).getTime()
    ).to.be.closeTo(today.getTime(), 10); // 10ms tolerance
  });

  test('mappingPutPanel maps panel with reviewers', () => {
    const panelBackEnd: PanelBackend = mappingPutPanel(MockPanelFrontendWithReviewers, cycleId);
    expect(panelBackEnd).to.deep.equal(MockPanelBackendWithReviewers);
  });

  test('mappingPutPanel maps panel with reviewers and generate assignedOn date when not provided', () => {
    const today = new Date();
    const myPanel = {
      ...MockPanelFrontendWithReviewers,
      sciReviewers: [{ ...MockPanelFrontendWithReviewers.sciReviewers[0], assignedOn: undefined }]
    };
    const expectedPanelBackend: PanelBackend = mappingPutPanel(myPanel, cycleId);
    expect(
      new Date(expectedPanelBackend.sci_reviewers[0].assigned_on as string).getTime()
    ).to.be.closeTo(today.getTime(), 10); // 10ms tolerance
  });
});

describe('PutPanel Service', () => {
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

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId);
    expect(result).toEqual('PANEL-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({ data: MockPanelFrontend.id });
    const result = (await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId)) as string;
    expect(result).to.deep.equal(MockPanelBackend.panel_id);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutPanel(mockedAuthClient, MockPanelFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
