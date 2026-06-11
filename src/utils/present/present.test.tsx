import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';
import Latex from 'react-latex-next';
import { NOT_APPLICABLE } from '../constants';
import {
  presentDate,
  presentDateTime,
  presentLatex,
  presentSensCalcError,
  presentTime,
  presentUnits,
  presentValue
} from './present';

describe('Present', () => {
  test('presentLatex : Dummy string', () => {
    expect(presentLatex('Dummy string')).toStrictEqual(<Latex>Dummy string</Latex>);
  });

  test('presentSensCalcError : Entry string', () => {
    expect(presentSensCalcError('')).toStrictEqual('');
  });
  test('presentSensCalcError : Entry string', () => {
    expect(presentSensCalcError('string 1')).toStrictEqual('string 1');
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
  test('presentUnits : μJy / beam', () => {
    expect(presentUnits('μJy / beam')).toBe('μJy/beam');
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

  test('presentDateTime : en-GB Europe/London', () => {
    expect(presentDateTime('2025-07-29T08:07:35.338860Z', 'en-GB', 'Europe/London')).toBe('29/07/2025, 09:07:35');
  });
  test('presentDate : en-GB Europe/London', () => {
    expect(presentDate('2025-07-29T08:07:35.338860Z', 'en-GB', 'Europe/London')).toBe('29/07/2025');
  });
  test('presentTime : en-GB Europe/London', () => {
    expect(presentTime('2025-07-29T08:07:35.338860Z', 'en-GB', 'Europe/London')).toBe('09:07:35');
  });
 test('presentDateTime : en-GB Europe/London BST', () => {
    expect(presentDateTime('2025-07-29T08:07:35.338860Z', 'en-GB', 'Europe/London', 'short')).toBe('29/07/2025, 09:07:35 BST');
  });
  test('presetTime : en-GB Europe/London BST', () => {
    expect(presentTime('2025-07-29T08:07:35.338860Z', 'en-GB', 'Europe/London', 'short')).toBe('09:07:35 BST');
  });
  test('presentDateTime : en-US America/New_York', () => {
    expect(presentDateTime('2025-07-29T08:07:35.338860Z', 'en-US', 'America/New_York')).toBe('7/29/2025, 04:07:35 AM');
  });
  test('presentDate : en-US America/New_York', () => {
    expect(presentDate('2025-07-29T08:07:35.338860Z', 'en-US', 'America/New_York')).toBe('7/29/2025');
  });
  test('presentTime : en-US America/New_York', () => {
    expect(presentTime('2025-07-29T08:07:35.338860Z', 'en-US', 'America/New_York')).toBe('04:07:35 AM');
  });
  test('presentDateTime : OSD legacy timestamp format', () => {
    expect(presentDateTime('20260327T12:00:00.000Z', 'en-GB', 'Europe/London')).toBe('27/03/2026, 12:00:00');
  });
  test('presentDate : OSD legacy timestamp format', () => {
    expect(presentDate('20260327T12:00:00.000Z', 'en-GB', 'Europe/London')).toBe('27/03/2026');
  });
    test('presentTime : OSD legacy timestamp format', () => {
    expect(presentTime('20260327T12:00:00.000Z', 'en-GB', 'Europe/London')).toBe('12:00:00');
  });
  test('presentDateTime " invalid date string', () => {
    expect(presentDateTime('invalid date string')).toBe('');
  });
  test('presentDate " invalid date string', () => {
    expect(presentDate('invalid date string')).toBe('');
  });
  test('presentTime " invalid date string', () => {
    expect(presentTime('invalid date string')).toBe('');
  });
});
