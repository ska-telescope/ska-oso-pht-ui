import { SUPPLIED_TYPE_INTEGRATION } from './constants';
import {
  DECIMAL_PLACES,
  IMAGE_WEIGHTING,
  RA_TYPE_GALACTIC,
  SENSITIVITY_UNITS,
  TELESCOPE_LOW_CODE,
  TIME_SECS,
  TIME_UNITS
} from './constants';
import { Telescope, ValueUnitPair } from './types/typesSensCalc';

export const isLow = (telescope: Telescope) => telescope?.code === TELESCOPE_LOW_CODE;

export const getImageWeightingMapping = (value: number) => {
  return IMAGE_WEIGHTING.find(e => e.value === value)?.lookup;
};

//TODO: Verify if this can be removed
// export const combineSensitivityAndWeightingFactor = (
//   inValues: ValueUnitPair,
//   factor: number,
//   symbol: string
// ) => {
//   const value = inValues.value;
//   const unit = inValues.unit;
//   return `${value?.toFixed(DECIMAL_PLACES)} ${unit} (${factor?.toFixed(DECIMAL_PLACES)})${symbol}`;
// };

export const getBeamSize = (obj: any, fraction: number = 1) => {
  return `${obj?.beam_maj.value.toFixed(fraction).toString()}" x ${obj?.beam_min.value
    .toFixed(fraction)
    .toString()}"`;
};

export const isNumeric = (n: string) =>
  !isNaN(parseFloat(n)) && isFinite(parseFloat(n)) && parseFloat(n) % 1 === 0;

export const sensitivityConversion = (inValue: any, from: number, to: number) => {
  return (inValue * SENSITIVITY_UNITS[to - 1]?.toBase) / SENSITIVITY_UNITS[from - 1]?.toBase;
};

const firstPart = (inValue: string, addBeam: boolean, sep: string = '/') => {
  if (addBeam) {
    const arr = inValue.split(sep);
    return arr[0];
  } else {
    return inValue;
  }
};

export const transformSurfaceBrightnessPerSubBandData = (inValues: {
  max_value: ValueUnitPair;
  min_value: ValueUnitPair;
}) => {
  const maxRange = shiftSensitivity(inValues.max_value);
  const minRange = shiftSensitivity(inValues.min_value);
  return `${maxRange.value.toFixed(DECIMAL_PLACES).toString()} ${
    inValues.max_value.unit
  } - ${minRange.value.toFixed(DECIMAL_PLACES).toString()} ${inValues.min_value.unit}`;
};

export const transformSynthesizedBeamSizePerSubBandData = (data: {
  max_value: any;
  min_value: any;
}) => {
  const maxRange = getBeamSize(data.max_value, DECIMAL_PLACES);
  const minRange = getBeamSize(data.min_value, DECIMAL_PLACES);
  return `${maxRange} - ${minRange}`;
};

export const transformPerSubBandData = (inValues: {
  max_value: ValueUnitPair;
  min_value: ValueUnitPair;
}) => {
  const maxRange = shiftSensitivity(inValues.max_value);
  const minRange = shiftSensitivity(inValues.min_value);
  return `${maxRange.value.toFixed(DECIMAL_PLACES).toString()} ${
    maxRange.unit
  } - ${minRange.value.toFixed(DECIMAL_PLACES).toString()} ${minRange.unit}`;
};

export const transformPerSubBandTime = (inValues: {
  max_value: ValueUnitPair;
  min_value: ValueUnitPair;
}) => {
  const maxRange = shiftTime(inValues.max_value, true);
  const minRange = shiftTime(inValues.min_value, true);
  return `${maxRange.value.toFixed(DECIMAL_PLACES).toString()} ${
    maxRange.unit
  } - ${minRange.value.toFixed(DECIMAL_PLACES).toString()} ${minRange.unit}`;
};

export const isGalactic = (skyDirectionType: any) => skyDirectionType === RA_TYPE_GALACTIC;

// Converts a Declination string value in degrees to its sexagesimal equivalent.
// It returns a Declination sexagesimal value.
// @param value Declination in decimal degrees.

export const degDecToSexagesimal = (value: string): string => {
  const decDeg = parseFloat(value);
  const sign = decDeg >= 0 ? '+' : '-';
  const absDecDeg = Math.abs(decDeg);
  const degrees = Math.floor(absDecDeg);
  const decMinutes = (absDecDeg - degrees) * 60;
  const minutes = Math.floor(decMinutes);
  const seconds = (decMinutes - minutes) * 60;
  const sexagesimal = `${sign}${String(degrees).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${seconds.toFixed(DECIMAL_PLACES).padStart(5, '0')}`;
  return sexagesimal;
};

// Converts a right ascension string value in degrees to its sexagesimal equivalent.
// It returns a right ascension sexagesimal value.
// @param value right ascension in decimal degrees.

export const degRaToSexagesimal = (value: string): string => {
  const decimalDegrees = parseFloat(value);
  const hours = Math.floor(decimalDegrees / 15);
  const remainingDegrees = decimalDegrees - hours * 15;
  const minutes = Math.floor(remainingDegrees * 4);
  const remainingMinutes = remainingDegrees * 4 - minutes;
  const seconds = remainingMinutes * 60;

  const sexagesimalString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${seconds.toFixed(2).padStart(5, '0')}`;
  return sexagesimalString;
};

export const isSuppliedTime = (suppliedType: number) => suppliedType === SUPPLIED_TYPE_INTEGRATION;

//TODO: Verify if this can be removed
// export const isSuppliedSensitivity = (suppliedType: number) =>
//   suppliedType === SUPPLIED_TYPE_SENSITIVITY;

export const getSensitivitiesUnitsMapping = (value: number) => {
  return SENSITIVITY_UNITS[value - 1].value;
};

export const shiftSensitivity = (inValues: ValueUnitPair) => {
  if (!inValues) {
    return { value: 0, unit: '' };
  }
  const addBeam = isNumeric(inValues.unit) || inValues.unit.includes('beam') ? false : true;
  const useUnits = addBeam ? inValues.unit + ' / beam' : inValues.unit;

  if (Number(inValues.value) === 0) {
    return { value: 0, unit: inValues.unit };
  }

  let posUnits = SENSITIVITY_UNITS.find(e => e.mapping === useUnits)?.id;
  const baseValue = sensitivityConversion(inValues.value, posUnits ? posUnits : 4, 4);
  if (baseValue > 1000000000) {
    posUnits = 1;
  } else if (baseValue > 1000000) {
    posUnits = 2;
  } else if (baseValue > 1000) {
    posUnits = 3;
  } else {
    posUnits = 4;
  }
  const outValue = sensitivityConversion(baseValue, 4, posUnits);
  if (SENSITIVITY_UNITS[posUnits - 1].value === 'μJy/beam') {
    return { value: outValue, unit: firstPart('μJy/beam', addBeam) };
  } else {
    return { value: outValue, unit: firstPart(SENSITIVITY_UNITS[posUnits - 1].value, addBeam) };
  }
};

// As above but works within the 'K' units
//TODO: Verify if this can be removed
// export const shiftSensitivityK = (inValues: ValueUnitPair) => {
//   if (!inValues) {
//     return { value: 0, unit: '' };
//   }
//   if (Number(inValues.value) === 0) {
//     return { value: 0, unit: inValues.unit };
//   }
//
//   let posUnits = SENSITIVITY_UNITS.find(e => e.mapping === inValues.unit)?.id;
//   const baseValue = sensitivityConversion(
//     inValues.value,
//     posUnits ? posUnits : SENSITIVITY_K,
//     SENSITIVITY_K
//   );
//   if (baseValue < 0.001) {
//     posUnits = 7;
//   } else if (baseValue < 1) {
//     posUnits = 6;
//   } else {
//     posUnits = SENSITIVITY_K;
//   }
//   const outValue = sensitivityConversion(baseValue, SENSITIVITY_K, posUnits);
//   return { value: outValue, unit: SENSITIVITY_UNITS[posUnits - 1].value };
// };

export const timeConversion = (inValue: any, from: number, to: number = TIME_SECS) => {
  return (inValue * TIME_UNITS[to - 1]?.toDay) / TIME_UNITS[from - 1]?.toDay;
};

export const shiftTime = (inValues: ValueUnitPair, secondsOnly = false) => {
  if (!inValues) {
    return { value: 0, unit: '' };
  }

  if (Number(inValues.value) === 0) {
    return { value: 0, unit: inValues.unit };
  }

  let posUnits = TIME_UNITS.find(e => e.value === inValues.unit)?.id;
  const baseValue = timeConversion(inValues.value, posUnits ? posUnits : 4, 4);
  if (!secondsOnly && baseValue > 1000000000) {
    posUnits = 1;
  } else if (!secondsOnly && baseValue > 1000000) {
    posUnits = 2;
  } else if (!secondsOnly && baseValue > 1000) {
    posUnits = 3;
  } else if (baseValue < 0.000001) {
    posUnits = 7;
  } else if (baseValue < 0.001) {
    posUnits = 6;
  } else if (baseValue < 1) {
    posUnits = 5;
  } else {
    posUnits = 4;
  }
  const outValue = timeConversion(baseValue, 4, posUnits);
  return { value: outValue, unit: TIME_UNITS[posUnits - 1].value };
};
