import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';
import { calculateEffectiveResolution, calculateSpectralResolution } from './calculate';
import { FREQUENCY_UNITS } from '../constants';
import { ValueUnitPair } from '../types/data';
import DATA from './observations.json';

/*
const testData = [
  {
    bandWidth: { value: 1, unit: '1' },
    continuum: false,
    frequency: { value: 1, unit: '1' },
    isLow: true,
    result: '14.13 Hz (4.2 km/s)'
  },
  {
    bandWidth: { value: 1, unit: '1' },
    continuum: false,
    frequency: { value: 1, unit: '1' },
    isLow: true,
    result: '14.13 Hz (4.2 km/s)'
  }
];
*/

const presentFrequency = (inPair: ValueUnitPair) => {
  return (
    inPair.value.toString() +
    ' ' +
    FREQUENCY_UNITS.find((e) => e.value.toString() === inPair.unit)?.mapping
  );
};

const presentContinuum = (inBool: boolean) => (inBool ? ' CONTINUUM ' : ' ');

const presentLow = (inBool: boolean) => (inBool ? 'LOW' : 'MID');

describe('calculateSpectralResolution', () => {
  DATA.forEach((rec) => {
    test(
      'Bandwidth ' +
        presentFrequency(rec.bandWidth) +
        ', ' +
        'Frequency ' +
        presentFrequency(rec.frequency) +
        ' ' +
        presentLow(rec.isLow) +
        presentContinuum(rec.continuum) +
        ' ==>> ' +
        rec.spectralResolution,
      () => {
        expect(
          calculateSpectralResolution(rec.bandWidth, rec.continuum, rec.frequency, rec.isLow)
        ).toBe(rec.spectralResolution);
      }
    );
  });
});

describe('calculateEffectiveResolution', () => {
  DATA.forEach((rec) => {
    test(
      'Bandwidth ' +
        presentFrequency(rec.bandWidth) +
        ', ' +
        'Frequency ' +
        presentFrequency(rec.frequency) +
        ' ' +
        'Averaging ' +
        rec.spectralAveraging +
        ' ' +
        presentLow(rec.isLow) +
        presentContinuum(rec.continuum) +
        ' ==>> ' +
        rec.spectralResolution,
      () => {
        expect(
          calculateEffectiveResolution(
            rec.bandWidth,
            rec.continuum,
            rec.frequency,
            rec.isLow,
            rec.spectralAveraging
          )
        ).toBe(rec.effectiveResolution);
      }
    );
  });
});
