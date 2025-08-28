import { describe, test } from 'vitest';
import {
  addFrequency,
  addRobustProperty,
  addTime,
  addValue,
  pointingCentre,
  rxBand
} from '@services/api/submissionEntries/submissionEntries.tsx';
import { NEW_STANDARD_DATA_LOW, NEW_ZOOM_DATA_LOW } from '@utils/types/typesSensCalc.tsx';
import { TIME_SECS } from '@utils/constantsSensCalc.ts';
import { FREQUENCY_MHZ, IW_BRIGGS, RA_TYPE_ICRS } from '@utils/constants.ts';

describe('Submission entries functions', () => {
  test('rx Band', () => {
    expect(rxBand('mid_band_1')).toBe('&rx_band=Band 1');
    expect(rxBand('mid_band_2')).toBe('&rx_band=Band 2');
    expect(rxBand('mid_band_3')).toBe('&rx_band=Band 3');
    expect(rxBand('mid_band_4')).toBe('&rx_band=Band 4');
    expect(rxBand('mid_band_5a')).toBe('&rx_band=Band 5a');
    expect(rxBand('mid_band_5b')).toBe('&rx_band=Band 5b');
    expect(rxBand('')).toBe('&rx_band=?????');
  });

  test('addValue', () => {
    expect(addValue('testLabel', 'testValue')).toBe('&testLabel=testValue');
  });

  test('addRobustProperty  ', () => {
    const theData = NEW_ZOOM_DATA_LOW;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties');
    theData.imageWeighting = IW_BRIGGS;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties&robustness=0');
  });

  test('addRobustProperty  ', () => {
    const theData = NEW_ZOOM_DATA_LOW;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties&robustness=0');
    theData.imageWeighting = IW_BRIGGS;
    expect(addRobustProperty(theData, 'properties')).toStrictEqual('properties&robustness=0');
  });

  test('addTime', () => {
    expect(addTime('integration_time_s', { value: 1, unit: '2' }, TIME_SECS)).toBe(
      '&integration_time_s=3600'
    );
  });

  test('addFrequency', () => {
    expect(addFrequency('freq_centre_mhz', { value: 1, unit: '2' }, FREQUENCY_MHZ)).toBe(
      '&freq_centre_mhz=1'
    );
  });

  const theData = NEW_STANDARD_DATA_LOW;
  //TODO: Resolve
  // test('pointingCentre galactic', () => {
  //   expect(pointingCentre(theData)).toBe('&pointing_centre=00:00:00.0 00:00:00.0');
  //   theData.raGalactic.value = '18:45:09.36';
  //   theData.raGalactic.unit = RA_TYPE_GALACTIC.value;
  //   theData.decGalactic.value = '-23:02:08.2';
  //   expect(pointingCentre(theData)).toBe('&pointing_centre=18:45:09.36 -23:02:08.2');
  // });

  test('pointingCentre equatorial', () => {
    theData.skyDirectionType = RA_TYPE_ICRS.value;
    expect(pointingCentre(theData)).toBe('&pointing_centre=00:00:00.00 +00:00:00.00');
    theData.raEquatorial.value = 0.5;
    theData.raGalactic.unit = RA_TYPE_ICRS.value;
    theData.decEquatorial.value = -1.5;
    expect(pointingCentre(theData)).toBe('&pointing_centre=00:02:00.00 -01:30:00.00');
  });
});
