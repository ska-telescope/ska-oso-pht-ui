import React from 'react';
import Latex from 'react-latex-next';
import { t } from 'i18next';
import 'katex/dist/katex.min.css';

export const presentLatex = (inStr: string) => <Latex>{inStr}</Latex>;

export const presentSensCalcError = (inArr: string, length = 0) => {
  if (!inArr || inArr.length === 0) {
    return '';
  }
  if (typeof inArr === 'string') {
    const arr = inArr.split('\n');
    return arr[length];
  }
  if (typeof inArr === 'object') {
    return inArr;
  }
  return 'Unknown error';
};

export const presentUnits = (inUnits: string) => {
  switch (inUnits) {
    case 'arcsec2':
      return 'arcsec\xb2';
    case 'arcsecs2':
      return 'arcsecs\xb2';
    default:
      return inUnits;
  }
};

export const presentValue = (inValue: string | number, eLabel?, fractionLength = 2) => {
  if (typeof inValue === 'string') {
    if (inValue.split(' ').length > 1) {
      return inValue;
    }
    const eArr = inValue.split('e');
    if (eArr.length > 1) {
      return Number(eArr[0]).toFixed(fractionLength) + 'e' + eArr[1];
    }
  }
  const result = Number(inValue);
  if (eLabel === 'continuumIntegrationTime' || eLabel === 'spectralIntegrationTime') {
    return result;
  }
  return result > 999 ? result.toExponential(1) : result.toFixed(fractionLength);
};

export const presentDate = (inString: string, reverse: boolean = false) =>
  t(reverse ? 'date_format_one' : 'date_format_two', { date: new Date(inString) });
export const presentTime = (inString: string) => t('time_format', { date: new Date(inString) });
export const presentDateTime = (inString: string, reverse: boolean = false) =>
  presentDate(inString, reverse) + ' ' + presentTime(inString);

export const roundSpectralResolution = (res: string) => {
  const spaceIndex = res.indexOf(' ');
  if (spaceIndex >= 0) {
    const numberStr = res.substring(0, spaceIndex);
    const number = Number(numberStr);
    if (!isNaN(number)) {
      const roundedNumber = number.toFixed(1);
      const unitStr = res.substring(spaceIndex);
      return roundedNumber + unitStr;
    }
  }
  return res;
};
