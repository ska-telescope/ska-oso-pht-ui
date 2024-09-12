import React from 'react';
import Latex from 'react-latex-next';
import { t } from 'i18next';
import 'katex/dist/katex.min.css';

export const presentLatex = (inStr: string) => <Latex>{inStr}</Latex>;

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

export const presentValue = (inValue: string | number, fractionLength = 2) => {
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
  return result > 999 ? result.toExponential(1) : result.toFixed(fractionLength);
};

export const presentDate = (inString: string, reverse: boolean = false) =>
  t(reverse ? 'date_format_one' : 'date_format_two', { date: new Date(inString) });
export const presentTime = (inString: string) => t('time_format', { date: new Date(inString) });
export const presentDateTime = (inString: string, reverse: boolean = false) =>
  presentDate(inString, reverse) + ' ' + presentTime(inString);
