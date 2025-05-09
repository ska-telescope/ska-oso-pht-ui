import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import {
  pointingCentre,
  rxBand,
  addNonZero,
  addMainData,
  addWarningData,
  addAdvancedData,
  subArrayLookup,
  addValue,
  addFrequency,
  addMapping,
  addMappingString,
  addRobustProperty,
  addSubBandResultData,
  addTime
} from './submissionEntries';
import {
  NEW_ADVANCED_DATA,
  NEW_STANDARD_DATA_LOW,
  NEW_ZOOM_DATA_LOW
} from '@/utils/types/data.tsx';
import { FREQUENCY_MHZ, IW_BRIGGS, RA_TYPE_GALACTIC, TIME_SECS } from '@/utils/constants.ts';
import { SUBARRAY_DATA_MID_MOCKED } from '../getSubArrayData/mockedSubArrayResults';

const addAdvancedDataResponse =
  '&eta_system=0.1&eta_coherence=0.1&eta_digitisation=0.1&eta_correlation=0.1&eta_bandpass=0.1&t_sys_ska=0.1&t_rx_ska=0.1&t_spl_ska=0.1&t_sys_meer=0.1&t_rx_meer=0.1&t_spl_meer=0.1&t_gal_ska=0.1&t_gal_meer=0.1';

describe('Submission entries', () => {
  test('addMapping ', () => {
    expect(addMapping('field', { value: 10, unit: 'k' })).toStrictEqual({
      field: 'field',
      value: '10',
      units: 'k'
    });
    expect(addMapping('field', { value: 0, unit: 'k' })).toStrictEqual({
      field: 'field',
      value: '0',
      units: 'k'
    });
  });
  test('addMappingString  ', () => {
    expect(addMappingString('field', 'value')).toStrictEqual({
      field: 'field',
      value: 'value',
      units: ''
    });
  });
  test('addRobustProperty  ', () => {
    const theData = NEW_ZOOM_DATA_LOW;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties');
    theData.imageWeighting = IW_BRIGGS;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties&robustness=0');
  });
  test('addAdvancedData', () => {
    const theData = NEW_ADVANCED_DATA;
    expect(addAdvancedData(theData)).toStrictEqual(addAdvancedDataResponse);
  });

  test('addSubBandResultData', () => {
    const cw = {
      subbands: []
    };
    const theData1 = {
      calculate: {},
      continuum_weighting: cw
    };
    const theResults1: any[] = [];
    expect(addSubBandResultData(theData1, theResults1)).toStrictEqual(undefined);
    const theData2 = {
      calculate: {}
    };
    const theResults2: any[] = [];
    expect(addSubBandResultData(theData2, theResults2)).toStrictEqual(undefined);
    const wr = {
      weighted_sensitivity_per_subband: { value: 10, unit: 'K' },
      confusion_noise_per_subband: { value: 20, unit: 'K' },
      total_sensitivity_per_subband: { value: 30, unit: 'K' },
      synthesized_beam_size_per_subband: { value: 40, unit: 'K' },
      surface_brightness_sensitivity_per_subband: {
        max_value: { value: 40, unit: 'K' },
        min_value: { value: 20, unit: 'K' }
      }
    };
    const theData3 = {
      calculate: {},
      transformed_result: {
        subbands: wr
      }
    };
    const theResults3: any[] = [];

    expect(addSubBandResultData(theData3, theResults3)).toStrictEqual(undefined);
    const theData4 = {
      calculate: {},
      transformed_result: {
        subbands: wr
      }
    };
    const theResults4: any[] = [];
    expect(addSubBandResultData(theData4, theResults4)).toStrictEqual(undefined);
  });

  test('addMainData', () => {
    const theData1 = {};
    const theResults1: any[] = [];
    expect(addMainData(theResults1, 'field', theData1, null)).toStrictEqual(undefined);
    expect(addMainData(theResults1, 'field', null, null)).toStrictEqual(undefined);
    expect(addMainData(theResults1, 'field', null, null, true)).toStrictEqual(undefined);
  });

  test('subArrayLookup', () => {
    const theData = NEW_STANDARD_DATA_LOW;
    theData.subarray = 'MID_AAstar_all';
    expect(subArrayLookup(theData, SUBARRAY_DATA_MID_MOCKED)).toBe('&subarray_configuration=AA*');
  });
  test('addTime', () => {
    expect(addTime('integration_time_s', { value: 1, unit: '2' }, TIME_SECS)).toBe(
      '&integration_time_s=3600'
    );
  });
  test('pointingCentre', () => {
    const theData = NEW_STANDARD_DATA_LOW;
    expect(pointingCentre(theData)).toBe('&pointing_centre=00:00:00.0 00:00:00.0');
    theData.raGalactic.value = '18:45:09.36';
    theData.raGalactic.unit = RA_TYPE_GALACTIC;
    theData.decGalactic.value = '-23:02:08.2';
    expect(pointingCentre(theData)).toBe('&pointing_centre=18:45:09.36 -23:02:08.2');
  });
  test('addFrequency', () => {
    expect(addFrequency('freq_centre_mhz', { value: 1, unit: '2' }, FREQUENCY_MHZ)).toBe(
      '&freq_centre_mhz=1'
    );
  });
  test('rxBand', () => {
    expect(rxBand('mid_band_1')).toBe('&rx_band=Band 1');
    expect(rxBand('mid_band_2')).toBe('&rx_band=Band 2');
    expect(rxBand('mid_band_3')).toBe('&rx_band=Band 3');
    expect(rxBand('mid_band_4')).toBe('&rx_band=Band 4');
    expect(rxBand('mid_band_5a')).toBe('&rx_band=Band 5a');
    expect(rxBand('mid_band_5b')).toBe('&rx_band=Band 5b');
    expect(rxBand('')).toBe('&rx_band=?????');
  });
  test('addValue', () => {
    expect(addValue('label', 10)).toBe('&label=10');
  });
  test('addNonZero', () => {
    expect(addNonZero('label', 10)).toBe('&label=10');
    expect(addNonZero('label', 0)).toBe('');
  });

  test('addWarningData', () => {
    const inData: string[] = ['WARNING'];
    const results: any[] = [];
    expect(addWarningData(inData, results)).toBeDefined();
  });

  test('addCustomWarningData', () => {
    const inData: string[] = ['WARNING'];
    const results: any[] = [];
    expect(addWarningData(inData, results, 'warningCustom')).toBeDefined();
  });
});
