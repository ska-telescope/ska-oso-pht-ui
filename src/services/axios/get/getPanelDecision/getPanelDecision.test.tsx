import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { MockPanelDecisionFrontend } from '@services/axios/post/postPanelDecision/mockPanelDecisionFrontend.tsx';
import { mappingPanelDecisionBackendToFrontend } from '@services/axios/put/putPanelDecision/putPanelDecision.tsx';
import { MockPanelDecisionBackend } from '@services/axios/post/postPanelDecision/mockPanelDecisionBackend.tsx';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend.tsx';
import { PanelDecision } from '@utils/types/panelDecision.tsx';
import getPanelDecision from './getPanelDecision.tsx';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('mapping returns mapped decision from backend to frontend format', () => {
    const panelDecisionFrontEnd: PanelDecision = mappingPanelDecisionBackendToFrontend(
      MockPanelDecisionBackend,
      cycleId
    );
    expect(panelDecisionFrontEnd).to.deep.equal(MockPanelDecisionFrontend);
  });
});

describe('GetPanelDecision Service', () => {
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

  test('returns mapped data from API', async () => {
    mockedAuthClient.get.mockResolvedValue({ data: MockPanelDecisionBackend });
    const result = (await getPanelDecision(mockedAuthClient, 'dummy_id', cycleId)) as PanelDecision;
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('returns error message on API failure', async () => {
    mockedAuthClient.get.mockRejectedValue(new Error('Network Error'));
    const result = await getPanelDecision(mockedAuthClient, 'dummy_id', cycleId);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    mockedAuthClient.get.mockRejectedValue({ unexpected: 'object' });
    const result = await getPanelDecision(mockedAuthClient, 'dummy_id', cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    mockedAuthClient.get.mockResolvedValue({});
    const result = await getPanelDecision(mockedAuthClient, 'dummy_id', cycleId);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
