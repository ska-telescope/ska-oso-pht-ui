import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { mappingPostPanelDecision } from '../postPanelDecision/postPanelDecision';
import { MockPanelDecisionFrontend } from '../postPanelDecision/mockPanelDecisionFrontend';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import PutPanelDecision, {
  mappingPutPanelDecision,
  putMockPanelDecision
} from './putPanelDecision';
import * as CONSTANTS from '@/utils/constants';
import { PanelDecision, PanelDecisionBackend } from '@/utils/types/panelDecision';
import { CYCLE } from '@/utils/constants';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  put: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  test('putMockPanelDecision returns MockPanelDecision', () => {
    const result = putMockPanelDecision();
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  // this checks the postPanelDecision mapping used to send data to the api
  test('mappingPostPanelDecision returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPostPanelDecision(
      MockPanelDecisionFrontend
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });

  // this checks the putPanelDecision mapping to receive response from the api
  test('mappingPutPanelDecision returns mapped panelDecision from backend to frontend format', () => {
    const panelDecision: PanelDecision = mappingPutPanelDecision(MockPanelDecisionBackend);
    expect(panelDecision).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('mappingPutPanelDecision generates cycle when not provided', () => {
    const receivedPanelDecision: PanelDecisionBackend = {
      ...MockPanelDecisionBackend,
      cycle: undefined
    };
    const panelFrontEnd: PanelDecision = mappingPutPanelDecision(receivedPanelDecision);
    const expectedPanelFrontend = { ...MockPanelDecisionFrontend, cycle: CYCLE };
    expect(panelFrontEnd).to.deep.equal(expectedPanelFrontend);
  });
});

describe('PostPanelDecision Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
