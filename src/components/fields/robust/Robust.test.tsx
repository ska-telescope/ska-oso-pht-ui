import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Robust from './Robust';
import { validateRobustNumber } from '@/utils/validation/validation';

describe('<Robust />', () => {
  test('renders correctly', () => {
    render(<Robust label={''} testId={''} value={''} />);
  });
  test('renders correctly, with suffix', () => {
    render(<Robust label={''} suffix={'?'} testId={''} value={''} />);
  });
});

describe('validateRobustNumber', () => {
  test('accepts valid decimal representations', () => {
    expect(validateRobustNumber('0')).toBe(true);
    expect(validateRobustNumber('-1')).toBe(true);
    expect(validateRobustNumber('1.5')).toBe(true);
    expect(validateRobustNumber('+2')).toBe(true);
    expect(validateRobustNumber('2.0')).toBe(true);
    expect(validateRobustNumber('-.5')).toBe(true);
  });

  test('rejects invalid numeric text', () => {
    expect(validateRobustNumber('')).toBe(false);
    expect(validateRobustNumber(' ')).toBe(false);
    expect(validateRobustNumber('abc')).toBe(false);
    expect(validateRobustNumber('1..2')).toBe(false);
    expect(validateRobustNumber('--1')).toBe(false);
  });

  test('rejects scientific notation', () => {
    expect(validateRobustNumber('1e-1')).toBe(false);
    expect(validateRobustNumber('2E3')).toBe(false);
    expect(validateRobustNumber('-4e+2')).toBe(false);
  });
});
