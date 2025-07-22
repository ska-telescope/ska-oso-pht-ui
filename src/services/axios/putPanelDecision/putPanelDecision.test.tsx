import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { mappingPanelDecisionFrontendToBackend } from '../postPanelDecision/postPanelDecision';
import { MockPanelDecisionFrontend } from '../postPanelDecision/mockPanelDecisionFrontend';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import { MockStore, StoreType } from '../MockStore';
import { mockCycleDataFrontend } from '../getCycleData/mockCycleDataFrontend';
import PutPanelDecision, {
  mappingPanelDecisionBackendToFrontend,
  putMockPanelDecision
} from './putPanelDecision';
import * as CONSTANTS from '@/utils/constants';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  put: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
  });
  test('putMockPanelDecision returns MockPanelDecision', () => {
    const result = putMockPanelDecision();
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  // this checks the postPanelDecision mapping used to send data to the api
  test('mappingPanelDecisionFrontendToBackend returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPanelDecisionFrontendToBackend(
      MockPanelDecisionFrontend
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });

  // this checks the putPanelDecision mapping to receive response from the api
  test('mappingPanelDecisionBackendtoFrontend returns mapped panelDecision from backend to frontend format', () => {
    const panelDecision: PanelDecision = mappingPanelDecisionBackendToFrontend(
      MockPanelDecisionBackend
    );
    expect(panelDecision).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('mappingPanelDecisionBackendtoFrontend generates cycle when not provided', () => {
    const receivedPanelDecision: PanelDecisionBackend = {
      ...MockPanelDecisionBackend,
      cycle: undefined
    };
    const panelFrontEnd: PanelDecision = mappingPanelDecisionBackendToFrontend(
      receivedPanelDecision
    );
    const expectedPanelFrontend = {
      ...MockPanelDecisionFrontend,
      cycle: mockCycleDataFrontend.observatoryPolicy.cycleInformation.cycleId
    };
    expect(panelFrontEnd).to.deep.equal(expectedPanelFrontend);
  });
});

describe('PostPanelDecision Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storageObject, 'useStore').mockReturnValue(MockStore as StoreType);
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toEqual(MockPanelDecisionFrontend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue({ data: MockPanelDecisionBackend });
    const result = (await PutPanelDecision(
      MockPanelDecisionFrontend.id,
      MockPanelDecisionFrontend
    )) as PanelDecision;
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue(undefined);
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue(null);
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
