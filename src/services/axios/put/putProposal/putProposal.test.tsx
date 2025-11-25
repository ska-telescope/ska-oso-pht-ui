import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { PROPOSAL_STATUS, RA_TYPE_GALACTIC, RA_TYPE_ICRS } from '@utils/constants.ts';
import * as CONSTANTS from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import PutProposal, { mockPutProposal } from './putProposal.tsx';
import MappingPutProposal, {
  getCalibrationStrategy,
  getReferenceCoordinate
} from './putProposalMapping.tsx';

describe('Helper Functions', () => {
  test('mockPutProposal returns mock proposal', () => {
    const result = mockPutProposal();
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('mappingPutProposal returns mapped proposal from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackend);
  });

  test.skip('mappingPutProposal returns mapped proposal with zoom observation from frontend to backend format', () => {
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      MockProposalFrontendZoom,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal(MockProposalBackendZoom);
  });

  test('mappingPutProposal returns mapped proposal and returns empty array of sub-type when not specified', () => {
    const proposal = { ...MockProposalFrontend, proposalSubType: undefined };
    const proposalBackEnd: ProposalBackend = MappingPutProposal(
      proposal,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(proposalBackEnd).to.deep.equal({
      ...MockProposalBackend,
      proposal_info: {
        ...MockProposalBackend.proposal_info,
        proposal_type: { ...MockProposalBackend.proposal_info.proposal_type, attributes: [] }
      }
    });
  });
});

describe('PutProposal Service', () => {
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
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('returns data from API when USE_LOCAL_DATA is false', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue({ data: MockProposalBackend });
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).to.deep.equal(MockProposalBackend);
  });

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue(new Error('Network Error'));
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'Network Error' });
  });

  test('returns error.API_UNKNOWN_ERROR when thrown error is not an instance of Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockRejectedValue({ unexpected: 'object' });
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result undefined', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(undefined);
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });

  test('returns error.API_UNKNOWN_ERROR when result null', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA', 'get').mockReturnValue(false);
    mockedAuthClient.put.mockResolvedValue(null);
    const result = await PutProposal(
      mockedAuthClient,
      MockProposalFrontend,
      false,
      PROPOSAL_STATUS.DRAFT
    );
    expect(result).toStrictEqual({ error: 'error.API_UNKNOWN_ERROR' });
  });
});

describe('getCalibrationStrategy', () => {
  test('should map calibration strategies with calibrators', () => {
    const input = [
      {
        observatoryDefined: true,
        id: 1,
        observationIdRef: 'obs-1',
        calibrators: [
          {
            calibrationIntent: 'intent1',
            name: 'cal1',
            durationMin: 10,
            choice: 'auto',
            notes: 'note1'
          }
        ],
        notes: 'strategy notes'
      }
    ];
    const result = getCalibrationStrategy(input as any);
    expect(result).toEqual([
      {
        observatory_defined: true,
        calibration_id: 1,
        observation_set_ref: 'obs-1',
        calibrators: [
          {
            calibration_intent: 'intent1',
            name: 'cal1',
            duration_min: 10,
            choice: 'auto',
            notes: 'note1'
          }
        ],
        notes: 'strategy notes'
      }
    ]);
  });

  test('should map calibration strategies with null calibrators', () => {
    const input = [
      {
        observatoryDefined: false,
        id: 2,
        observationIdRef: 'obs-2',
        calibrators: null,
        notes: 'no calibrators'
      }
    ];
    const result = getCalibrationStrategy(input as any);
    expect(result).toEqual([
      {
        observatory_defined: false,
        calibration_id: 2,
        observation_set_ref: 'obs-2',
        calibrators: null,
        notes: 'no calibrators'
      }
    ]);
  });

  test('should return empty array for empty input', () => {
    expect(getCalibrationStrategy([])).toEqual([]);
  });

  test('should handle undefined input', () => {
    expect(getCalibrationStrategy(undefined as any)).toBeUndefined();
  });
});

describe('getReferenceCoordinate', () => {
  it('should map galactic coordinates correctly', () => {
    const galactic = {
      kind: RA_TYPE_GALACTIC.value,
      l: 123.4,
      b: 56.7,
      pmL: 1.1,
      pmB: 2.2,
      epoch: 'J2000',
      parallax: 0.5
    };
    const result = getReferenceCoordinate(galactic);
    expect(result).toEqual({
      kind: RA_TYPE_GALACTIC.label,
      l: 123.4,
      b: 56.7,
      pm_l: 1.1,
      pm_b: 2.2,
      epoch: 'J2000',
      parallax: 0.5
    });
  });

  it('should map ICRS coordinates correctly', () => {
    const icrs = {
      kind: RA_TYPE_ICRS.value,
      raStr: '12:34:56.7',
      decStr: '-12:34:56.7',
      pmRa: 0.1,
      pmDec: 0.2,
      epoch: 'J2000',
      parallax: 0.3
    };
    const result = getReferenceCoordinate(icrs);
    expect(result).toEqual({
      kind: RA_TYPE_ICRS.label,
      ra_str: '12:34:56.7',
      dec_str: '-12:34:56.7',
      pm_ra: 0.1,
      pm_dec: 0.2,
      epoch: 'J2000',
      parallax: 0.3
    });
  });
});
