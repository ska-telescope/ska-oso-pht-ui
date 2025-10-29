import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import {
  validateSkyDirection1Number,
  validateSkyDirection1Text
} from '@utils/validation/validation.tsx';
import SkyDirection1 from './SkyDirection1';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SkyDirection1 />', () => {
  test('renders correctly', () => {
    wrapper(<SkyDirection1 skyUnits={0} value={''} />);
  });
});

describe('validateSkyDirection1Text function', () => {
  test('validates correct equatorial format', () => {
    expect(validateSkyDirection1Text('12:34:56')).toBe(true);
    expect(validateSkyDirection1Text('2:34:56')).toBe(true);
    expect(validateSkyDirection1Text('-12:34:56')).toBe(true);
    expect(validateSkyDirection1Text('+12:34:56')).toBe(true);
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateSkyDirection1Text('123:45:67')).toBe(false); // Invalid hours
    expect(validateSkyDirection1Text('12:345:67')).toBe(false); // Invalid minutes
    expect(validateSkyDirection1Text('12:3:67')).toBe(false); // Invalid minutes
    expect(validateSkyDirection1Text('12:34:567')).toBe(false); // Invalid seconds
    expect(validateSkyDirection1Text('12:34:5')).toBe(false); // Invalid seconds
    expect(validateSkyDirection1Text('12:34')).toBe(false); // Missing seconds
    expect(validateSkyDirection1Text('12:34:')).toBe(false); // Missing seconds value
    expect(validateSkyDirection1Text('')).toBe(false); // Empty string
    expect(validateSkyDirection1Text('abc:def:ghi')).toBe(false); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateSkyDirection1Text('12:34:56.789')).toBe(true); // Valid fractional seconds
    expect(validateSkyDirection1Text('-12:34:56.789')).toBe(true); // Valid negative fractional seconds
  });

  test('rejects out-of-range values', () => {
    expect(validateSkyDirection1Text('91:00:00')).toBe(false); // Hours out of range
    expect(validateSkyDirection1Text('-91:00:00')).toBe(false); // Negative hours out of range
    expect(validateSkyDirection1Text('12:60:00')).toBe(false); // Minutes out of range
    expect(validateSkyDirection1Text('12:34:60')).toBe(false); // Seconds out of range
  });

  test('rejects targets not visible', () => {
    expect(validateSkyDirection1Text('50:00:00')).toBe(false);
    expect(validateSkyDirection1Text('89:50:00')).toBe(false);
    expect(validateSkyDirection1Text('90:00:00')).toBe(false);
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
