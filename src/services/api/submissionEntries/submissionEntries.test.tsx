import { describe, test } from 'vitest';
import { addValue, rxBand } from '@services/api/submissionEntries/submissionEntries.tsx';

describe('Submission entries functions', () => {
  test('rx Band', () => {
    expect(rxBand('mid_band_1')).toBe('&rx_band=Band 1');
    expect(rxBand('mid_band_2')).toBe('&rx_band=Band 2');
    expect(rxBand('mid_band_3')).toBe('&rx_band=Band 3');
    expect(rxBand('mid_band_4')).toBe('&rx_band=Band 4');
    expect(rxBand('mid_band_5a')).toBe('&rx_band=Band 5a');
    expect(rxBand('mid_band_5b')).toBe('&rx_band=Band 5b');
    expect(rxBand('low')).toBe('&rx_band=?????');
  });

  test('addValue', () => {
    expect(addValue('testLabel', 'testValue')).toBe('&testLabel=testValue');
  });

  // test('addTime', () => {
  //   expect(addTime('testTimeLabel', { unit: 'min', value: 6000}, 4)).toBe('&testTimeLabel=testValue');
  // });
});
