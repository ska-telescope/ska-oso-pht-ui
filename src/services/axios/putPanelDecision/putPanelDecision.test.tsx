import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import { mappingPostPanelDecision } from '../postPanelDecision/postPanelDecision';
import { MockPanelDecisionFrontend } from '../postPanelDecision/mockPanelDecisionFrontend';
import { MockPanelDecisionBackend } from '../postPanelDecision/mockPanelDecisionBackend';
import PutPanelDecision, { putMockPanelDecision } from './putPanelDecision';
import * as CONSTANTS from '@/utils/constants';
import { PanelDecisionBackend } from '@/utils/types/panelDecision';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  put: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  test('putMockPanelDecision returns MockPanelDecisionBackend', () => {
    const result = putMockPanelDecision();
    expect(result).to.equal(MockPanelDecisionBackend);
  });

  test('mappingPanelDecision returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPostPanelDecision(
      MockPanelDecisionFrontend
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });
});

describe('PostPanelDecision Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PutPanelDecision(MockPanelDecisionFrontend.id, MockPanelDecisionFrontend);
    expect(result).toEqual(MockPanelDecisionBackend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.put.mockResolvedValue({ data: MockPanelDecisionBackend });
    const result = (await PutPanelDecision(
      MockPanelDecisionFrontend.id,
      MockPanelDecisionFrontend
    )) as PanelDecisionBackend;
    expect(result).to.deep.equal(MockPanelDecisionBackend);
  });

  /*
  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue(new Error('Network Error'));
    const result = await PostPanelDecision(MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockRejectedValue({ unexpected: 'object' });
    const result = await PostPanelDecision(MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(undefined);
    const result = await PostPanelDecision(MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue(null);
    const result = await PostPanelDecision(MockPanelDecisionFrontend);
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
  */
});
