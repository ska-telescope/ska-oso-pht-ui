import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import {
  validateSkyDirection2Number,
  validateSkyDirection2Text
} from '@utils/validation/validation.tsx';
import SkyDirection2 from './SkyDirection2';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SkyDirection2 />', () => {
  test('renders correctly', () => {
    wrapper(<SkyDirection2 skyUnits={0} value={''} />);
  });
});

describe('validateSkyDirection2Text function', () => {
  cons = true;
  test('validates correct equatorial format', () => {
    expect(validateSkyDirection2Text('12:34:56')).toBe(null);
    expect(validateSkyDirection2Text('2:34:56')).toBe(null);
    expect(validateSkyDirection2Text('-12:34:56')).toBe(null);
    expect(validateSkyDirection2Text('+12:34:56')).toBe(null);
    expect(validateSkyDirection2Text('-90:00:00')).toBe(null);
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateSkyDirection2Text('123:45:67')).toBe('0'); // Invalid hours
    expect(validateSkyDirection2Text('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateSkyDirection2Text('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateSkyDirection2Text('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateSkyDirection2Text('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateSkyDirection2Text('12:34')).toBe('0'); // Missing seconds
    expect(validateSkyDirection2Text('12:34:')).toBe('0'); // Missing seconds value
    expect(validateSkyDirection2Text('')).toBe('0'); // Empty string
    expect(validateSkyDirection2Text('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateSkyDirection2Text('12:34:56.789')).toBe(null); // Valid fractional seconds
    expect(validateSkyDirection2Text('-12:34:56.789')).toBe(null); // Valid negative fractional seconds
    expect(validateSkyDirection2Text('-90:00:00.0')).toBe(null); // Valid edge case with fractional seconds
  });

  test('rejects out-of-range values', () => {
    expect(validateSkyDirection2Text('91:00:00')).toBe('1'); // Hours out of range
    expect(validateSkyDirection2Text('-91:00:00')).toBe('1'); // Negative hours out of range
    expect(validateSkyDirection2Text('12:60:00')).toBe('1'); // Minutes out of range
    expect(validateSkyDirection2Text('12:34:60')).toBe('1'); // Seconds out of range
  });

  test('rejects targets not visible', () => {
    expect(validateSkyDirection2Text('50:00:00')).toBe('2');
    expect(validateSkyDirection2Text('89:50:00')).toBe('2');
    expect(validateSkyDirection2Text('90:00:00')).toBe('2');
  });
});

describe('validateSkyDirection2Number function', () => {
  cons = true;

  test('validates correct galactic format', () => {
    expect(validateSkyDirection2Number('12.58')).toBe(null);
    expect(validateSkyDirection2Number('30')).toBe(null);
    expect(validateSkyDirection2Number('25.8')).toBe(null);
    expect(validateSkyDirection2Number('-90.0')).toBe(null);
  });

  test('rejects incorrect format', () => {
    expect(validateSkyDirection2Number('')).toBe('0'); // Empty string
    expect(validateSkyDirection2Number('abc.def.ghi')).toBe('0'); // Non-numeric input
    expect(validateSkyDirection2Number('00.ghi')).toBe('0'); // Non-numeric input
    expect(validateSkyDirection2Number('aaa.5')).toBe('0'); // Non-numeric input
  });

  test('rejects out-of-range values', () => {
    expect(validateSkyDirection2Number('91.0')).toBe('1');
    expect(validateSkyDirection2Number('-91.0')).toBe('1');
    expect(validateSkyDirection2Number('150')).toBe('1');
    expect(validateSkyDirection2Number('-95.583333')).toBe('1');
  });

  test('rejects targets not visible', () => {
    expect(validateSkyDirection2Number('50.0')).toBe('2');
    expect(validateSkyDirection2Number('89.833333')).toBe('2');
    expect(validateSkyDirection2Number('90.0')).toBe('2');
  });
});
