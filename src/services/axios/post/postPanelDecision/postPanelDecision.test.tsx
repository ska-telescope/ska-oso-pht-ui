import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend.tsx';
import { PanelDecisionBackend } from '@utils/types/panelDecision.tsx';
import PostPanelDecision, { mappingPanelDecisionFrontendToBackend } from './postPanelDecision.tsx';
import { MockPanelDecisionFrontend } from './mockPanelDecisionFrontend.tsx';
import { MockPanelDecisionBackend } from './mockPanelDecisionBackend.tsx';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('mappingPanelDecisionFrontendToBackend returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPanelDecisionFrontendToBackend(
      MockPanelDecisionFrontend,
      cycleId
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });

  test('mappingPanelDecisionFrontendToBackend generates cycle when not provided', () => {
    const myPanelDecision = { ...MockPanelDecisionFrontend, cycle: undefined };
    const panelBackEnd: PanelDecisionBackend = mappingPanelDecisionFrontendToBackend(
      myPanelDecision,
      cycleId
    );
    const expectedPanelBackend = {
      ...MockPanelDecisionBackend,
      cycle: MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId
    };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });
});

describe('PostPanelDecision Service', () => {
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

  test('returns data id from API', async () => {
    mockedAuthClient.post.mockResolvedValue({ data: MockPanelDecisionFrontend.id });
    const result = (await PostPanelDecision(
      mockedAuthClient,
      MockPanelDecisionFrontend,
      cycleId
    )) as string;
    expect(result).to.deep.equal(MockPanelDecisionBackend.decision_id);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanelDecision(mockedAuthClient, MockPanelDecisionFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanelDecision(mockedAuthClient, MockPanelDecisionFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    mockedAuthClient.post.mockResolvedValue(undefined);
    const result = await PostPanelDecision(mockedAuthClient, MockPanelDecisionFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    mockedAuthClient.post.mockResolvedValue(null);
    const result = await PostPanelDecision(mockedAuthClient, MockPanelDecisionFrontend, cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
