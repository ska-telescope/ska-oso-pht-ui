import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MockPanelDecisionFrontend } from '../postPanelDecision/mockPanelDecisionFrontend';
import { mappingPanelDecisionBackendToFrontend } from '../putPanelDecision/putPanelDecision';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import getPanelDecision, { getMockPanelDecision } from './getPanelDecision';
import { PanelDecision } from '@/utils/types/panelDecision';
import * as CONSTANTS from '@/utils/constants';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  // add other axios methods as needed
};

describe('Helper Functions', () => {
  test('getMockPanelDecision returns mock panel', () => {
    const result = getMockPanelDecision();
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('mapping returns mapped decision from backend to frontend format', () => {
    const panelDecisionFrontEnd: PanelDecision = mappingPanelDecisionBackendToFrontend(
      MockPanelDecisionBackend
    );
    expect(panelDecisionFrontEnd).to.deep.equal(MockPanelDecisionFrontend);
  });
});

describe('GetPanelDecision Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mapped mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await getPanelDecision('dummy_id');
    expect(result).toEqual(MockPanelDecisionFrontend);
  });

  test('returns mapped data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: MockPanelDecisionBackend });
    const result = (await getPanelDecision('dummy_id')) as PanelDecision;
    expect(result).to.deep.equal(MockPanelDecisionFrontend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    const result = await getPanelDecision('dummy_id');
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockRejectedValue({ unexpected: 'object' });
    const result = await getPanelDecision('dummy_id');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when API does not return data property', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({});
    const result = await getPanelDecision('dummy_id');
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});
