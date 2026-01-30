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
  IW_BRIGGS,
  PST_MODES,
  TYPE_ZOOM_LONG
} from '@utils/constants.ts';
import * as CONSTANTS from '@utils/constants.ts';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import {
  DataProductSDPNew,
  DataProductSDPPSTDetectedFilterBankBackend,
  DataProductSRC,
  DataProductSRCNetBackend,
  SDPFilterbankPSTData,
  SDPVisibilitiesContinuumData
} from '@utils/types/dataProduct.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { MockProposalFrontend, MockProposalFrontendZoom } from './mockProposalFrontend.tsx';
import { MockProposalBackend, MockProposalBackendZoom } from './mockProposalBackend.tsx';
import PutProposal, { mockPutProposal } from './putProposal.tsx';
import MappingPutProposal, {
  getCalibrationStrategy,
  getDataProductRef,
  getDataProductScriptParameters,
  getDataProductSRC,
  getObservationTypeDetails,
  getReferenceCoordinate,
  getSuppliedFieldsIntegrationTime
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
      id: 'dp-1',
      observationId: '1',
      data: {
        dataProductType: DP_TYPE_IMAGES,
        imageSizeValue: 10,
        imageSizeUnits: 1,
        pixelSizeValue: 2,
        pixelSizeUnits: 2,
        weighting: 1,
        polarisations: ['XX'],
        channelsOut: 4,
        taperValue: 0.5
      }
    } as DataProductSDPNew;
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
      id: 'dp-2',
      observationId: '1',
      data: {
        dataProductType: 2,
        timeAveraging: 5,
        frequencyAveraging: 10
      } as SDPVisibilitiesContinuumData
    } as DataProductSDPNew;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      kind: 'continuum',
      variant: 'visibilities',
      time_averaging: { value: 5, unit: 'second' },
      frequency_averaging: { value: 10, unit: 'MHz' }
    });
  });

  test('should return correct parameters for zoom', () => {
    const dp = {
      id: 'dp-3',
      observationId: '2',
      data: {
        imageSizeValue: 20,
        imageSizeUnits: 2,
        pixelSizeValue: 1,
        pixelSizeUnits: 0,
        weighting: 2,
        polarisations: ['XY'],
        channelsOut: 8,
        taperValue: 0.1,
        continuumSubtraction: true,
        robust: 1
      }
    } as DataProductSDPNew;
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
      id: 'dp-4',
      observationId: '3',
      data: {
        dataProductType: DETECTED_FILTER_BANK_VALUE,
        polarisations: ['YX'],
        bitDepth: 8,
        outputFrequencyResolution: 1,
        outputSamplingInterval: 1,
        dispersionMeasure: 10,
        rotationMeasure: 5
      } as SDPFilterbankPSTData
    } as DataProductSDPNew;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      polarisations: ['YX'],
      bit_depth: 8,
      output_frequency_resolution: 1,
      output_sampling_interval: 1,
      dispersion_measure: 10,
      rotation_measure: 5,
      kind: 'pst',
      variant: 'detected filterbank'
    } as DataProductSDPPSTDetectedFilterBankBackend);
  });

  test('should return pulsar timing for PST', () => {
    const dp = {
      id: 'dp-4',
      observationId: '4'
    } as any;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      kind: 'pst',
      variant: 'pulsar timing'
    });
  });

  test('should return flow through for PST', () => {
    const dp = {
      id: 'dp-5',
      observationId: '5',
      data: {
        polarisations: ['YX'],
        bitDepth: 32
      }
    } as DataProductSDPNew;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result).toMatchObject({
      polarisations: ['YX'],
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
      id: 'dp-1',
      observationId: '1',
      data: {
        dataProductType: DP_TYPE_IMAGES,
        imageSizeValue: 1,
        imageSizeUnits: 0,
        pixelSizeValue: 1,
        pixelSizeUnits: 0,
        weighting: IW_BRIGGS,
        robust: 2,
        polarisations: [],
        channelsOut: 1,
        taperValue: 0
      }
    } as DataProductSDPNew;
    const result = getDataProductScriptParameters(obs, dp);
    expect(result?.weight?.weighting).toBe('briggs');
    expect(result?.weight?.robust).toBe(2);
  });
});

describe('getDataProductSRC', () => {
  test('should map DataProductSRC array to DataProductSRCNetBackend array', () => {
    const input: Partial<DataProductSRC>[] = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const expected: DataProductSRCNetBackend[] = [
      { data_products_src_id: '1' },
      { data_products_src_id: '2' },
      { data_products_src_id: '3' }
    ];
    expect(getDataProductSRC(input)).toEqual(expected);
  });

  test('should return an empty array if input is empty', () => {
    expect(getDataProductSRC([])).toEqual([]);
  });

  test('should handle undefined or null id values', () => {
    const input = [{ id: undefined }, { id: null }];
    const expected = [{ data_products_src_id: undefined }, { data_products_src_id: null }];
    expect(getDataProductSRC(input as any)).toEqual(expected);
  });
});

describe('getObservationTypeDetails', () => {
  const mockObsBase = {
    getBandwidth: () => ({ value: 100, unit: 'MHz' }),
    getCentralFrequency: () => ({ value: 1400, unit: 'MHz' }),
    getSupplied: () => ({ supplied_type: 'test' })
  };

  test('should return correct details for TYPE_CONTINUUM', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_CONTINUUM
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_CONTINUUM);
    expect(result.bandwidth).toBeDefined();
    expect(result.central_frequency).toBeDefined();
    expect(result.supplied).toBeDefined();
  });

  test('should return correct details for TYPE_ZOOM', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_ZOOM,
      spectralResolution: 1.2,
      effectiveResolution: 2.3,
      spectralAveraging: 4
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_ZOOM_LONG);
    expect(result.spectral_resolution).toBe(1.2);
    expect(result.effective_resolution).toBe(2.3);
    expect(result.spectral_averaging).toBe('4');
    expect(result.number_of_channels).toBe('1024');
  });

  test('should return correct details for TYPE_PST', () => {
    const obs = {
      ...mockObsBase,
      type: TYPE_PST,
      pstMode: 1
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_PST);
    expect(result.pst_mode).toBe(PST_MODES[1].mapping);
  });

  test('should return correct details for unknown type (default)', () => {
    const obs = {
      ...mockObsBase,
      type: 999
    } as any;
    const result = getObservationTypeDetails(obs);
    expect(result.observation_type).toBe(TYPE_PST);
  });
});

describe('getSuppliedFieldsIntegrationTime', () => {
  const mockTarObs = {
    sensCalc: {
      section3: [{ value: 123, units: 'hr', field: 'integrationTime' }]
    }
  } as any;

  test('should return correct values for continuum type', () => {
    const result = getSuppliedFieldsIntegrationTime('integration_time', TYPE_CONTINUUM, mockTarObs);
    expect(result).toEqual({
      supplied_type: 'integration_time',
      continuum: { value: 123, unit: 'hr' },
      spectral: { value: 123, unit: 'hr' }
    });
  });

  test('should return 0 and empty string for non-continuum type', () => {
    const result = getSuppliedFieldsIntegrationTime('integration_time', 999, mockTarObs);
    expect(result).toEqual({
      supplied_type: 'integration_time',
      continuum: { value: 0, unit: '' },
      spectral: { value: 123, unit: 'hr' }
    });
  });

  test('should handle missing section3 gracefully', () => {
    const tarObs = { sensCalc: {} } as any;
    const result = getSuppliedFieldsIntegrationTime('integration_time', TYPE_CONTINUUM, tarObs);
    expect(result).toEqual({
      supplied_type: 'integration_time',
      continuum: { value: NaN, unit: '' },
      spectral: { value: NaN, unit: '' }
    });
  });
});

describe('getDataProductRef', () => {
  test('returns the id as string when observationId matches', () => {
    const incTarObs = { observationId: 'obs-1' } as TargetObservation;
    const incDataProductSDP = [
      { observationId: 'obs-1', id: '123' } as Partial<DataProductSDPNew>,
      { observationId: 'obs-2', id: '456' } as Partial<DataProductSDPNew>
    ];
    expect(getDataProductRef(incTarObs, incDataProductSDP as DataProductSDPNew[])).toBe('123');
  });

  test('returns "undefined" string if no match is found', () => {
    const incTarObs = { observationId: 'obs-3' } as TargetObservation;
    const incDataProductSDP = [
      { observationId: 'obs-1', id: '123' } as Partial<DataProductSDPNew>,
      { observationId: 'obs-2', id: '456' } as Partial<DataProductSDPNew>
    ];
    expect(getDataProductRef(incTarObs, incDataProductSDP as DataProductSDPNew[])).toBe(
      'undefined'
    );
  });

  test('returns "undefined" string if id is undefined', () => {
    const incTarObs = { observationId: 'obs-1' } as TargetObservation;
    const incDataProductSDP = [
      { observationId: 'obs-1', id: undefined } as Partial<DataProductSDPNew>
    ];
    expect(getDataProductRef(incTarObs, incDataProductSDP as DataProductSDPNew[])).toBe(
      'undefined'
    );
  });
});
