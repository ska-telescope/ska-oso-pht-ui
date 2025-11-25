import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import {
  PROPOSAL_STATUS,
  RA_TYPE_GALACTIC,
  RA_TYPE_ICRS,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  TYPE_PST,
  DP_TYPE_IMAGES,
  DETECTED_FILTER_BANK_VALUE,
  PULSAR_TIMING_VALUE,
  IW_BRIGGS
} from '@utils/constants.ts';
import * as CONSTANTS from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import PutProposal, { mockPutProposal } from './putProposal.tsx';
import MappingPutProposal, {
  getCalibrationStrategy,
  getDataProductScriptParameters,
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
  test('should map galactic coordinates correctly', () => {
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

  test('should map ICRS coordinates correctly', () => {
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

describe('getDataProductScriptParameters', () => {
  const obs = [
    { id: '1', type: TYPE_CONTINUUM, pstMode: undefined },
    { id: '2', type: TYPE_ZOOM, pstMode: undefined },
    { id: '3', type: TYPE_PST, pstMode: DETECTED_FILTER_BANK_VALUE },
    { id: '4', type: TYPE_PST, pstMode: PULSAR_TIMING_VALUE },
    { id: '5', type: TYPE_PST, pstMode: 999 }
  ] as any[];

  test('should return correct parameters for continuum image', () => {
    const dp = {
      observationId: '1',
      dataProductType: DP_TYPE_IMAGES,
      imageSizeValue: 10,
      imageSizeUnits: 1,
      pixelSizeValue: 2,
      pixelSizeUnits: 2,
      weighting: 1,
      polarisations: ['XX'],
      channelsOut: 4,
      fitSpectralPol: true,
      taperValue: 0.5
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      image_size: { value: 10, unit: 'arcmin' },
      image_cellsize: { value: 2, unit: 'arcsec' },
      kind: 'continuum',
      variant: 'continuum image'
    });
  });

  test('should return correct parameters for continuum visibilities', () => {
    const dp = {
      observationId: '1',
      dataProductType: 'not_images',
      imageSizeValue: 10,
      imageSizeUnits: 0,
      pixelSizeValue: 2,
      pixelSizeUnits: 1,
      weighting: 1,
      polarisations: ['YY'],
      channelsOut: 2,
      fitSpectralPol: false,
      taperValue: 1.5,
      timeAveraging: 5,
      frequencyAveraging: 10
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      image_size: { value: 10, unit: 'deg' },
      image_cellsize: { value: 2, unit: 'arcmin' },
      kind: 'continuum',
      variant: 'visibilities',
      time_averaging: { value: 5, unit: '' },
      frequency_averaging: { value: 10, unit: '' }
    });
  });

  test('should return correct parameters for zoom', () => {
    const dp = {
      observationId: '2',
      imageSizeValue: 20,
      imageSizeUnits: 2,
      pixelSizeValue: 1,
      pixelSizeUnits: 0,
      weighting: 2,
      polarisations: ['XY'],
      channelsOut: 8,
      fitSpectralPol: true,
      taperValue: 0.1,
      continuumSubtraction: true
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      image_size: { value: 20, unit: 'arcsec' },
      image_cellsize: { value: 1, unit: 'deg' },
      kind: 'spectral',
      variant: 'spectral image',
      continuum_subtraction: true
    });
  });

  test('should return detected filterbank for PST', () => {
    const dp = {
      observationId: '3',
      polarisations: ['YX'],
      bitDepth: 8,
      timeAveraging: 2,
      frequencyAveraging: 3
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      polarisation: ['YX'],
      bit_depth: 8,
      time_averaging_factor: 2,
      frequency_averaging_factor: 3,
      kind: 'pst',
      variant: 'detected filterbank'
    });
  });

  test('should return pulsar timing for PST', () => {
    const dp = {
      observationId: '4',
      polarisations: ['YX'],
      bitDepth: 16
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      polarisation: ['YX'],
      bit_depth: 16,
      kind: 'pst',
      variant: 'pulsar timing'
    });
  });

  test('should return flow through for PST', () => {
    const dp = {
      observationId: '5',
      polarisations: ['YX'],
      bitDepth: 32
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      polarisation: ['YX'],
      bit_depth: 32,
      kind: 'pst',
      variant: 'flow through'
    });
  });

  test('should handle missing obs gracefully', () => {
    const dp = { observationId: 'notfound' } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toBeDefined();
  });

  test('should include robust if weighting is IW_BRIGGS', () => {
    const dp = {
      observationId: '1',
      dataProductType: DP_TYPE_IMAGES,
      imageSizeValue: 1,
      imageSizeUnits: 0,
      pixelSizeValue: 1,
      pixelSizeUnits: 0,
      weighting: IW_BRIGGS,
      robust: 2,
      polarisations: [],
      channelsOut: 1,
      fitSpectralPol: false,
      taperValue: 0
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result.weight.weighting).toBeDefined();
    expect(result.weight.robust).toBe(2);
  });
});
