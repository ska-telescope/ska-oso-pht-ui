import { describe, test, expect, vi, it, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import getSensCalc from './getSensitivityCalculatorAPIData';
import {
  sensCalcResultsAPIResponseMockContinuum,
  sensCalcResultsAPIResponseMockSpectral
} from './SensCalcResultsAPIResponseMOCK';
import { SENSCALC_CONTINUUM_MOCKED, SENSCALC_SPECTRAL_MOCKED } from './SensCalcResultsMock';
import { setMockObservation } from './getSensitivityCalculatorAPIData';
import axiosClient from '@/services/axios/axiosClient/axiosClient';
import * as CONSTANTS from '@/utils/constants';
import { DataProductSDPNew, SDPImageContinuumData, SDPSpectralData } from '@/utils/types/dataProduct';
import Observation from '@/utils/types/observation';

const MOCK_CONTINUUM_DATA_PRODUCT: DataProductSDPNew = {
  id: 'dp-123456',
  observationId: 'obs-123456',
  data: {
    dataProductType: CONSTANTS.DP_TYPE_IMAGES,
    imageSizeValue: CONSTANTS.IMAGE_SIZE_DEFAULT,
    imageSizeUnits: CONSTANTS.IMAGE_SIZE_UNIT_DEFAULT,
    pixelSizeValue: CONSTANTS.PIXEL_SIZE_DEFAULT,
    pixelSizeUnits: CONSTANTS.PIXEL_SIZE_UNIT_DEFAULT,
    weighting: CONSTANTS.IW_UNIFORM,
    polarisations: ['I', 'XX'],
    channelsOut: CONSTANTS.CHANNELS_OUT_DEFAULT,
    robust: CONSTANTS.ROBUST_DEFAULT,
    taperValue: CONSTANTS.TAPER_DEFAULT
  } as SDPImageContinuumData
};

const mockCombinedDataProduct = (channelsOut: number): DataProductSDPNew => ({
  id: 'dp-123456',
  observationId: 'obs-123456',
  data: {
    imageSizeValue: CONSTANTS.IMAGE_SIZE_DEFAULT,
    imageSizeUnits: CONSTANTS.IMAGE_SIZE_UNIT_DEFAULT,
    pixelSizeValue: CONSTANTS.PIXEL_SIZE_DEFAULT,
    pixelSizeUnits: CONSTANTS.PIXEL_SIZE_UNIT_DEFAULT,
    weighting: CONSTANTS.IW_UNIFORM,
    polarisations: ['I', 'XX'],
    channelsOut,
    robust: CONSTANTS.ROBUST_DEFAULT,
    taperValue: CONSTANTS.TAPER_DEFAULT,
    continuumSubtraction: true
  } as SDPSpectralData
});

const COMBINED_OBSERVATION: Observation = {
  ...CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW,
  type: CONSTANTS.TYPE_CONTINUUM_SPECTRAL
};

describe('getSensitivityCalculatorAPIData Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mock('../axiosClient', () => ({
      default: { get: vi.fn() }
    }));
  });

  test('returns mapped mock data when USE_LOCAL_DATA_SENSITIVITY_CALC is true', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(true);
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW,
      CONSTANTS.DEFAULT_TARGETS,
      MOCK_CONTINUUM_DATA_PRODUCT
    );
    expect(result).toEqual(SENSCALC_CONTINUUM_MOCKED);
  });

  test('returns continuum mapped data from API', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockResolvedValue({
      data: sensCalcResultsAPIResponseMockContinuum
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW,
      CONSTANTS.DEFAULT_TARGETS,
      MOCK_CONTINUUM_DATA_PRODUCT
    );
    expect(result).to.deep.equal(SENSCALC_CONTINUUM_MOCKED);
  });

  test('returns spectral mapped data from API', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockResolvedValue({
      data: sensCalcResultsAPIResponseMockSpectral
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_ZOOM_OBSERVATION_LOW,
      CONSTANTS.DEFAULT_TARGETS,
      MOCK_CONTINUUM_DATA_PRODUCT
    );
    expect(result).to.deep.equal(SENSCALC_SPECTRAL_MOCKED);
  });

  test.each([
    { channelsOut: 1, expectedBandwidthMhz: 150 },
    { channelsOut: 4000, expectedBandwidthMhz: 150 / 4000 }
  ])(
    'returns continuum mapped data for combined mode with channelsOut=$channelsOut, using continuumBandwidth / channelsOut as the request bandwidth',
    async ({ channelsOut, expectedBandwidthMhz }) => {
      vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
      const getSpy = vi
        .spyOn(axiosClient, 'get')
        .mockResolvedValue({ data: sensCalcResultsAPIResponseMockContinuum });

      const result = await getSensCalc(
        COMBINED_OBSERVATION,
        CONSTANTS.DEFAULT_TARGETS,
        mockCombinedDataProduct(channelsOut)
      );

      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining(`bandwidth_mhz=${expectedBandwidthMhz}`)
      );
      expect(result).to.deep.equal(SENSCALC_CONTINUUM_MOCKED);
    }
  );

  // IMPROVEMENT add tests for mid continuum and spectral
  // IMPROVEMENT add tests for mid supplied sensitivity
  // IMPROVEMENT add tests for custom and natural

  test('returns error message on API failure', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    vi.spyOn(axiosClient, 'get').mockRejectedValue(new Error('Network Error'));
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW,
      CONSTANTS.DEFAULT_TARGETS,
      MOCK_CONTINUUM_DATA_PRODUCT
    );
    expect(result).to.deep.equal({ error: 'Sensitivity Calculator API error: Network Error' });
  });

  test('returns error message on Sensitivity Calculator Error', async () => {
    vi.spyOn(CONSTANTS, 'USE_LOCAL_DATA_SENSITIVITY_CALC', 'get').mockReturnValue(false);
    const errorOut = {
      title: 'Validation Error',
      detail: 'Specified pointing centre is always below the horizon from the SKA LOW site'
    };
    vi.spyOn(axiosClient, 'get').mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: errorOut, status: 400, statusText: 'Bad Request' },
      message: errorOut.detail
    });
    const result = await getSensCalc(
      CONSTANTS.DEFAULT_CONTINUUM_OBSERVATION_LOW,
      CONSTANTS.DEFAULT_TARGETS,
      MOCK_CONTINUUM_DATA_PRODUCT
    );
    expect(result).to.deep.equal({
      error:
        'Validation Error: Specified pointing centre is always below the horizon from the SKA LOW site'
    });
  });
});

describe('setMockObservation', () => {
  it('returns a new object and does not mutate the input', () => {
    const original: Observation = CONSTANTS.DEFAULT_PST_OBSERVATION_LOW;
    const copy = setMockObservation(original);
    expect(original.type).toBe(CONSTANTS.TYPE_PST);
    expect(copy.type).toBe(CONSTANTS.TYPE_CONTINUUM);
    expect(copy).not.toBe(original);
    expect(copy.id).toBe(original.id);
  });
});
