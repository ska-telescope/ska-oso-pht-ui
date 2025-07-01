import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';
import Latex from 'react-latex-next';
import { NOT_APPLICABLE } from '../constants';
import { presentDate, presentLatex, presentUnits, presentValue } from './present';

describe('Present', () => {
  test('presentLatex : Dummy string', () => {
    expect(presentLatex('Dummy string')).toStrictEqual(<Latex>Dummy string</Latex>);
  });

  test('presentUnits : kHz', () => {
    expect(presentUnits('kHz')).toBe('kHz');
  });
  test('presentUnits : arcsec2', () => {
    expect(presentUnits('arcsec2')).toBe('arcsec\xb2');
  });
  test('presentUnits : arcsecs2', () => {
    expect(presentUnits('arcsecs2')).toBe('arcsecs\xb2');
  });
  test('presentUnits : Jy / beam', () => {
    expect(presentUnits('Jy / beam')).toBe('Jy/beam');
  });
  test('presentUnits : uJy / beam', () => {
    expect(presentUnits('uJy / beam')).toBe('μJy/beam');
  });
  test('presentUnits : rad / m2', () => {
    expect(presentUnits('rad / m2')).toBe('rad/m\xb2');
  });
  test('presentUnits : pc/cm3', () => {
    expect(presentUnits('pc/cm3')).toBe('pc/cm\xb3');
  });

  test('presentValue : NOT_APPLICABLE', () => {
    expect(presentValue(NOT_APPLICABLE)).toBe(NOT_APPLICABLE);
  });
  test('presentValue : 12345', () => {
    expect(presentValue('12345', 2)).toBe('1.2e+4');
  });
  test('presentValue : <- ->', () => {
    expect(presentValue('<- ->', 2)).toBe('<- ->');
  });
  test('presentValue : 2e4', () => {
    expect(presentValue('2e4', 2)).toBe('2.00e4');
  });
  test('presentValue : 3.142579', () => {
    expect(presentValue(3.142579, 2)).toBe('3.14');
  });
  test('presentValue : 314257.9', () => {
    expect(presentValue(314257.9, 2)).toBe('3.1e+5');
  });
  test('presentValue : 0', () => {
    expect(presentValue(0, 2)).toBe('0');
  });
  test('presentValue : spectralSurfaceBrightnessSensitivity', () => {
    expect(presentValue(3, 4)).toBe('3.0000');
  });
  test('presentValue : maxFaradayDepth', () => {
    expect(presentValue(3, 4)).toBe('3.0000');
  });
});
