import { describe, it, expect } from 'vitest';
import { IW_BRIGGS, RA_TYPE_GALACTIC, SEPARATOR1 } from '@utils/constantsSensCalc.ts';
import {
  addRobustProperty,
  addFrequency,
  addTime,
  addValue,
  pointingCentre,
  rxBand
} from './submissionEntries';

describe('addRobustProperty', () => {
  it('adds robustness when imageWeighting is IW_BRIGGS', () => {
    const mockData = { imageWeighting: IW_BRIGGS, robust: 0.5 };
    const result = addRobustProperty(mockData, 'initial');
    expect(result).toContain('robustness');
  });

  it('returns unchanged properties when imageWeighting is not IW_BRIGGS', () => {
    const mockData = { imageWeighting: 'natural', robust: 0.5 };
    const result = addRobustProperty(mockData, 'initial');
    expect(result).toBe('initial');
  });
});

describe('addFrequency', () => {
  it('formats frequency string correctly', () => {
    const result = addFrequency('freq', { value: 100, unit: '1' }, 1);
    expect(result).toContain('freq=');
  });
});

describe('addTime', () => {
  it('formats time string correctly', () => {
    const result = addTime('time', { value: 50, unit: '1' }, 1);
    expect(result).toContain('time=');
  });
});

describe('addValue', () => {
  it('formats value string correctly', () => {
    const result = addValue('label', 'value');
    expect(result).toBe(`${SEPARATOR1}label=value`);
  });
});

describe('pointingCentre', () => {
  it('returns galactic coordinates when isGalactic is true', () => {
    const data = {
      skyDirectionType: RA_TYPE_GALACTIC,
      raGalactic: { value: '123.4' },
      decGalactic: { value: '-56.7' }
    };
    const result = pointingCentre(data, '');
    expect(result).toContain('pointing_centre=123.4 -56.7');
  });

  it('returns equatorial coordinates when isGalactic is false', () => {
    const data = {
      skyDirectionType: 'equatorial',
      raEquatorial: { value: 123.456 },
      decEquatorial: { value: -45.678 }
    };
    const result = pointingCentre(data);
    expect(result).toContain('pointing_centre=');
    expect(result).toMatch(/:/); // sexagesimal format
  });
});

describe('rxBand', () => {
  const bands = [
    ['mid_band_1', 'Band 1'],
    ['mid_band_2', 'Band 2'],
    ['mid_band_3', 'Band 3'],
    ['mid_band_4', 'Band 4'],
    ['mid_band_5a', 'Band 5a'],
    ['mid_band_5b', 'Band 5b'],
    ['unknown_band', '?????']
  ];

  bands.forEach(([input, expected]) => {
    it(`returns correct label for ${input}`, () => {
      const result = rxBand(input);
      expect(result).toContain(`rx_band=${expected}`);
    });
  });
});
