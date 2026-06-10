import Latex from 'react-latex-next';
import { t } from 'i18next';
import 'katex/dist/katex.min.css';
import { NOT_APPLICABLE } from '../constants';

export const presentLatex = (inStr: string) => <Latex>{inStr}</Latex>;

export const presentSensCalcError = (inArr: string, length = 0) => {
  if (!inArr) {
    return '';
  }
  const arr = inArr.split('\n');
  return arr[length];
};

export const presentUnits = (inUnits: string) => {
  switch (inUnits) {
    case 'arcsec2':
      return 'arcsec\xb2';
    case 'arcsecs2':
      return 'arcsecs\xb2';
    case 'arcmin2':
      return 'arcmin\xb2';
    case 'degrees2':
      return 'degrees\xb2';
    case 'degree2':
      return 'degree\xb2';
    case 'pc/cm3':
      return 'pc/cm\xb3';
    case 'Jy / beam':
      return 'Jy/beam';
    case 'μJy / beam':
      return 'μJy/beam';
    case 'rad / m2':
      return 'rad/m\xb2';
    default:
      return inUnits;
  }
};

export const presentValue = (inValue: string | number, fractionLength = 2) => {
  if (inValue === NOT_APPLICABLE) {
    return inValue;
  }
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
  if (result === 0) {
    return '0';
  }
  return result < 0.01 || result > 999 ? result.toExponential(1) : result.toFixed(fractionLength);
};

const normalizeDateString = (input: string): string => {
  if (!input) return '';
  const match = /^(\d{4})(\d{2})(\d{2})T/.exec(input);
  return match
    ? `${match[1]}-${match[2]}-${match[3]}T${input.slice(match[0].length)}`
    : input;
};

const parseDate = (input: string): Date | null => {
  const date = new Date(normalizeDateString(input));
  return isNaN(date.getTime()) ? null : date;
};

const formatDate = (input: string, options: Intl.DateTimeFormatOptions): string => {
  const date = parseDate(input);
  if (!date){
    return '';
  }
  return new Intl.DateTimeFormat(undefined, options).format(date);
}

export const presentDate = (input: string) => 
  formatDate(input, { year: 'numeric', month: 'numeric', day: 'numeric' });

export const presentTime = (input: string) =>
  formatDate(input, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const presentDateTime = (input: string) =>
  formatDate(input, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

export const trimText = (text: string, maxLength: number): string => {
  if (!text || maxLength <= 0) return '';
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + '...' : text;
};
