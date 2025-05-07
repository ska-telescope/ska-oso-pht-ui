import {
  DECIMAL_PLACES,
  FREQUENCY_HZ,
  FREQUENCY_UNITS,
  SPEED_OF_LIGHT,
  VELOCITY_UNITS
} from '../constantsSensCalc';
import { frequencyConversion } from '../helpersSensCalc';
import { ValueUnitPair } from '../types/typesSensCalc';

export const calculateVelocity = (resolutionHz: number, frequencyHz: number, precision = 1) => {
  const velocity =
    frequencyHz && frequencyHz > 0 ? (resolutionHz / frequencyHz) * SPEED_OF_LIGHT : 0;
  const occ = velocity < 1000 ? 0 : 1;
  return (
    (velocity / VELOCITY_UNITS[occ].toMS).toFixed(precision) + ' ' + VELOCITY_UNITS[occ].mapping
  );
};

const LOWContinuumBase = () => 5.43;
const LOWZoomBase = (bandWidth: ValueUnitPair) => {
  const powersTwo = [1, 2, 4, 8, 16, 32, 64, 128];
  const baseSpectralResolutionHz = (781250 * 32) / 27 / 4096 / 16;
  const results = powersTwo.map(obj => obj * baseSpectralResolutionHz);
  return (results[bandWidth?.value - 1] as unknown) as number;
};

const MIDContinuumBase = () => 13.44;
const MIDZoomBase = (bandWidth: ValueUnitPair) => {
  const results = [0.21, 0.42, 0.84, 1.68, 3.36, 6.72, 13.44];
  return results[bandWidth.value - 1];
};
const LOWBase = (bandWidth: ValueUnitPair, continuum: boolean) =>
  continuum ? LOWContinuumBase() : LOWZoomBase(bandWidth);
const MIDBase = (bandWidth: ValueUnitPair, continuum: boolean) =>
  continuum ? MIDContinuumBase() : MIDZoomBase(bandWidth);

export const getSpectralResolutionBaseValue = (
  bandWidth: ValueUnitPair,
  continuum: boolean,
  isLow: boolean
) => (isLow ? LOWBase(bandWidth, continuum) : MIDBase(bandWidth, continuum));

export const calculateSpectralResolution = (
  bandWidth: ValueUnitPair,
  continuum: boolean,
  frequency: ValueUnitPair,
  isLow: boolean
) => {
  const calculateLOW = () =>
    calculateVelocity(
      getSpectralResolutionBaseValue(bandWidth, continuum, isLow),
      frequency?.value * (continuum ? 1000 : 1e6)
    );

  const calculateMID = () => {
    // TODO : Why do we need to multiply by 1000 ?
    return calculateVelocity(
      getSpectralResolutionBaseValue(bandWidth, continuum, isLow) * 1000,
      frequency?.value ? frequencyConversion(frequency?.value, Number(frequency?.unit)) : 0
    );
  };

  const calculate = () => {
    return isLow ? calculateLOW() : calculateMID();
  };

  const getFrequencyUnits = (isLow: boolean, continuum: boolean) =>
    isLow
      ? continuum
        ? FREQUENCY_UNITS[2].mapping
        : FREQUENCY_UNITS[3].mapping
      : FREQUENCY_UNITS[2].mapping;

  return `${getSpectralResolutionBaseValue(bandWidth, continuum, isLow).toFixed(
    DECIMAL_PLACES
  )} ${getFrequencyUnits(isLow, continuum)} (${calculate()})`;
};

export const calculateEffectiveResolution = (
  bandWidth: ValueUnitPair,
  continuum: boolean,
  frequency: ValueUnitPair,
  isLow: boolean,
  spectralAveraging: number
) => {
  const spectralResolution = calculateSpectralResolution(bandWidth, continuum, frequency, isLow);
  const arr = spectralResolution.split(' ');
  const resolution = Number(arr[0]);
  const resolutionUnits = FREQUENCY_UNITS?.find(e => e.mapping === arr[1])?.value ?? FREQUENCY_HZ;
  const freq = frequencyConversion(frequency?.value, Number(frequency?.unit));
  const ave = resolution * spectralAveraging;
  const velocity = calculateVelocity(frequencyConversion(ave, resolutionUnits), freq);
  return `${ave.toFixed(DECIMAL_PLACES)} ${arr[1]} (${velocity})`;
};
