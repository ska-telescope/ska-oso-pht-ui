import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';
import PostPanelDecision, {
  mappingPostPanelDecision,
  postMockPanelDecision
} from './postPanelDecision';
import { MockPanelDecisionFrontend } from './mockPanelDecisionFrontend';
import { MockPanelDecisionBackend } from './mockPanelDecisionBackend';
import * as CONSTANTS from '@/utils/constants';
import { CYCLE } from '@/utils/constants';
import { PanelDecisionBackend } from '@/utils/types/panelDecision';

vi.mock('axios');
const mockedAxios = (axios as unknown) as {
  post: ReturnType<typeof vi.fn>;
};

describe('Helper Functions', () => {
  test('postMockPanelDecision returns mock id', () => {
    const result = postMockPanelDecision();
    expect(result).to.equal('PANEL-DECISION-ID-001');
  });

  test('mappingPostPanelDecision returns mapped panelDecision from frontend to backend format', () => {
    const panelDecisionBackEnd: PanelDecisionBackend = mappingPostPanelDecision(
      MockPanelDecisionFrontend
    );
    expect(panelDecisionBackEnd).to.deep.equal(MockPanelDecisionBackend);
  });

  test('mappingPostPanelDecision generates cycle when not provided', () => {
    const myPanelDecision = { ...MockPanelDecisionFrontend, cycle: undefined };
    const panelBackEnd: PanelDecisionBackend = mappingPostPanelDecision(myPanelDecision);
    const expectedPanelBackend = { ...MockPanelDecisionBackend, cycle: CYCLE };
    expect(panelBackEnd).to.deep.equal(expectedPanelBackend);
  });
});

describe('PostPanelDecision Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('returns mock data id when USE_LOCAL_DATA is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(true);
    const result = await PostPanelDecision(MockPanelDecisionFrontend);
    expect(result).toEqual('PANEL-DECISION-ID-001');
  });

  test('returns data id from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAxios.post.mockResolvedValue({ data: MockPanelDecisionFrontend.id });
    const result = (await PostPanelDecision(MockPanelDecisionFrontend)) as string;
    expect(result).to.deep.equal(MockPanelDecisionBackend.decision_id);
  });

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
});
