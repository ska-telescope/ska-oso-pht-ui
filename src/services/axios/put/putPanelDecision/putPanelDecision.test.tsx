import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { mappingPanelDecisionFrontendToBackend } from '@services/axios/post/postPanelDecision/postPanelDecision.tsx';
import { MockPanelDecisionFrontend } from '@services/axios/post/postPanelDecision/mockPanelDecisionFrontend.tsx';
import { MockPanelDecisionBackend } from '@services/axios/post/postPanelDecision/mockPanelDecisionBackend.tsx';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend.tsx';
import * as CONSTANTS from '@utils/constants.ts';
import { PanelDecision, PanelDecisionBackend } from '@utils/types/panelDecision.tsx';
import PutPanelDecision, {
  mappingPanelDecisionBackendToFrontend,
  putMockPanelDecision
} from './putPanelDecision.tsx';

const cycleId = MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId;

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('putMockPanelDecision returns MockPanelDecision', () => {
    const result = putMockPanelDecision(cycleId);
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  // this checks the postPanelDecision mapping used to send data to the api
  test('mappingPanelDecisionFrontendToBackend returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPanelDecisionFrontendToBackend(
      MockPanelDecisionFrontend,
      cycleId
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });

  // this checks the putPanelDecision mapping to receive response from the api
  test('mappingPanelDecisionBackendToFrontend returns mapped panelDecision from backend to frontend format', () => {
    const panelDecision: PanelDecision = mappingPanelDecisionBackendToFrontend(
      MockPanelDecisionBackend,
      cycleId
    );
    expect(panelDecision).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('mappingPanelDecisionBackendToFrontend generates cycle when not provided', () => {
    const receivedPanelDecision: PanelDecisionBackend = {
      ...MockPanelDecisionBackend,
      cycle: undefined
    };
    const panelFrontEnd: PanelDecision = mappingPanelDecisionBackendToFrontend(
      receivedPanelDecision,
      cycleId
    );
    const expectedPanelFrontend = {
      ...MockPanelDecisionFrontend,
      cycle: MockObservatoryDataFrontend.policies[0].cycleInformation.cycleId
    };
    expect(panelFrontEnd).to.deep.equal(expectedPanelFrontend);
  });
});

describe('PutPanelDecision Service', () => {
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

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutPanelDecision(mockedAuthClient, MockPanelDecisionFrontend);
    expect(result).toEqual(MockPanelDecisionFrontend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({ data: MockPanelDecisionBackend });
    const result = (await PutPanelDecision(
      mockedAuthClient,
      MockPanelDecisionFrontend
    )) as PanelDecision;
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutPanelDecision(mockedAuthClient, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutPanelDecision(mockedAuthClient, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutPanelDecision(mockedAuthClient, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutPanelDecision(mockedAuthClient, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
