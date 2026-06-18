import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import {
  validateSkyDirection1Number,
  validateSkyDirection1Text
} from '@utils/validation/validation.tsx';
import SkyDirection1 from './SkyDirection1';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SkyDirection1 />', () => {
  test('renders correctly', () => {
    wrapper(<SkyDirection1 skyUnits={0} value={''} />);
  });
});

describe('validateSkyDirection1Text function', () => {
  test('validates correct equatorial format', () => {
    expect(validateSkyDirection1Text('12:34:56')).toBeNull();
    expect(validateSkyDirection1Text('2:34:56')).toBeNull();
    expect(validateSkyDirection1Text('+12:34:56')).toBeNull();
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateSkyDirection1Text('123:45:67')).toBe('0'); // Invalid hours
    expect(validateSkyDirection1Text('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateSkyDirection1Text('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateSkyDirection1Text('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateSkyDirection1Text('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateSkyDirection1Text('12:34')).toBe('0'); // Missing seconds
    expect(validateSkyDirection1Text('12:34:')).toBe('0'); // Missing seconds value
    expect(validateSkyDirection1Text('')).toBe('0'); // Empty string
    expect(validateSkyDirection1Text('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateSkyDirection1Text('12:34:56.789')).toBeNull(); // Valid fractional seconds
    expect(validateSkyDirection1Text('12:34:56.789 ')).toBeNull(); // Valid with trailing whitespace
    expect(validateSkyDirection1Text('12:34:56.')).toBeNull(); // Valid trailing dot
  });

  test('rejects out-of-range values', () => {
    expect(validateSkyDirection1Text('91:00:00')).toBe('1'); // Hours out of range
    expect(validateSkyDirection1Text('-91:00:00')).toBe('0'); // Negative sign → format error
    expect(validateSkyDirection1Text('12:60:00')).toBe('0'); // Minutes > 59 is a format error (hours are fine)
    expect(validateSkyDirection1Text('12:34:60')).toBe('0'); // Seconds >= 60 is a format error (hours are fine)
  });

  test('rejects negative values', () => {
    expect(validateSkyDirection1Text('-12:34:56')).toBe('0');
    expect(validateSkyDirection1Text('-12:34:56.789')).toBe('0');
  });

  test('rejects targets not visible', () => {
    expect(validateSkyDirection1Text('50:00:00')).toBe('1');
    expect(validateSkyDirection1Text('89:50:00')).toBe('1');
    expect(validateSkyDirection1Text('90:00:00')).toBe('1');
  });
});

describe('validateSkyDirection1Number function', () => {
  test('validates correct galactic format', () => {
    expect(validateSkyDirection1Number('12.58')).toBe(true);
    expect(validateSkyDirection1Number('30')).toBe(true);
    expect(validateSkyDirection1Number('25.8')).toBe(true);
  });

  test('rejects incorrect format', () => {
    expect(validateSkyDirection1Number('')).toBe(false); // Empty string
    expect(validateSkyDirection1Number('abc.def.ghi')).toBe(false); // Non-numeric input
    expect(validateSkyDirection1Number('00.ghi')).toBe(false); // Non-numeric input
    expect(validateSkyDirection1Number('aaa.5')).toBe(false); // Non-numeric input
  });

  test('rejects out-of-range values', () => {
    expect(validateSkyDirection1Number('400.0')).toBe(false);
    expect(validateSkyDirection1Number('-91.0')).toBe(false);
  });
});
