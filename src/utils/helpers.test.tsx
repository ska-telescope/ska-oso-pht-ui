import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { helpers, leadZero, trailingZeros } from '@/utils/helpers.ts';

describe('Helper functions, validateTextEntry', () => {
  test('Valid input passes TITLE validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'Hello?!',
      mockSetText,
      mockSetErrorText,
      'TITLE'
    );
    expect(result).toBe(true);
    expect(mockSetText).toHaveBeenCalledWith('Hello?!');
    expect(mockSetErrorText).toHaveBeenCalledWith('');
  });

  test('Other valid input passes TITLE validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'Hello, World: Testing - 123%',
      mockSetText,
      mockSetErrorText,
      'TITLE'
    );
    expect(result).toBe(true);
    expect(mockSetText).toHaveBeenCalledWith('Hello, World: Testing - 123%');
    expect(mockSetErrorText).toHaveBeenCalledWith('');
  });

  test('Invalid input fails TITLE validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'Invalid@Text',
      mockSetText,
      mockSetErrorText,
      'TITLE'
    );
    expect(result).toBe(false);
    expect(mockSetText).not.toHaveBeenCalled();
    expect(mockSetErrorText).toHaveBeenCalled();
  });

  test('Valid input passes DEFAULT validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'Hello',
      mockSetText,
      mockSetErrorText,
      'DEFAULT'
    );
    expect(result).toBe(true);
    expect(mockSetText).toHaveBeenCalledWith('Hello');
    expect(mockSetErrorText).toHaveBeenCalledWith('');
  });

  test('Invalid input fails DEFAULT validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'InvalidText?',
      mockSetText,
      mockSetErrorText,
      'DEFAULT'
    );
    expect(result).toBe(false);
    expect(mockSetText).not.toHaveBeenCalled();
    expect(mockSetErrorText).toHaveBeenCalled();
  });

  test('Valid input passes EMAIL validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'user@gmail.com',
      mockSetText,
      mockSetErrorText,
      'EMAIL'
    );
    expect(result).toBe(true);
    expect(mockSetText).toHaveBeenCalledWith('user@gmail.com');
    expect(mockSetErrorText).toHaveBeenCalledWith('');
  });

  test('Invalid input fails EMAIL validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'InvalidEmail',
      mockSetText,
      mockSetErrorText,
      'EMAIL'
    );
    expect(result).toBe(false);
    expect(mockSetText).not.toHaveBeenCalled();
    expect(mockSetErrorText).toHaveBeenCalled();
  });

  test('Valid input passes NUMBER_ONLY validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      '123456',
      mockSetText,
      mockSetErrorText,
      'NUMBER_ONLY'
    );
    expect(result).toBe(true);
    expect(mockSetText).toHaveBeenCalledWith('123456');
    expect(mockSetErrorText).toHaveBeenCalledWith('');
  });

  test('Invalid input fails NUMBER_ONLY validation', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    const result = helpers.validate.validateTextEntry(
      'InvalidNumber123',
      mockSetText,
      mockSetErrorText,
      'NUMBER_ONLY'
    );
    expect(result).toBe(false);
    expect(mockSetText).not.toHaveBeenCalled();
    expect(mockSetErrorText).toHaveBeenCalled();
  });

  test('Throws error for unknown textType', () => {
    const mockSetText = vi.fn();
    const mockSetErrorText = vi.fn();
    expect(() =>
      helpers.validate.validateTextEntry('Hello?', mockSetText, mockSetErrorText, 'UNKNOWN' as any)
    ).toThrow('Invalid text type: UNKNOWN');
  });
});

describe('leadZero', () => {
  it('adds leading zero to positive single-digit numbers', () => {
    expect(leadZero('5:30:15')).toBe('05:30:15');
  });

  it('adds leading zero to negative single-digit numbers', () => {
    expect(leadZero('-5:30:15')).toBe('-05:30:15');
  });

  it('does not modify already formatted positive numbers', () => {
    expect(leadZero('15:30:15')).toBe('15:30:15');
  });

  it('does not modify already formatted negative numbers', () => {
    expect(leadZero('-15:30:15')).toBe('-15:30:15');
  });

  it('handles edge case of zero correctly', () => {
    expect(leadZero('0:30:15')).toBe('00:30:15');
  });

  it('strips leading + and pads single-digit hours', () => {
    expect(leadZero('+2:34:56')).toBe('02:34:56');
  });

  it('strips leading + from already two-digit hours', () => {
    expect(leadZero('+12:34:56')).toBe('12:34:56');
  });
});

describe('trailingZeros', () => {
  it('appends .000 when no fractional part', () => {
    expect(trailingZeros('12:34:56')).toBe('12:34:56.000');
  });

  it('pads trailing dot to .000', () => {
    expect(trailingZeros('12:34:56.')).toBe('12:34:56.000');
  });

  it('pads one decimal place to .000', () => {
    expect(trailingZeros('12:34:56.0')).toBe('12:34:56.000');
  });

  it('pads two decimal places to .000', () => {
    expect(trailingZeros('12:34:56.00')).toBe('12:34:56.000');
  });

  it('leaves three decimal places unchanged', () => {
    expect(trailingZeros('12:34:56.000')).toBe('12:34:56.000');
  });

  it('leaves non-zero fractional seconds unchanged when already 3 places', () => {
    expect(trailingZeros('12:34:56.789')).toBe('12:34:56.789');
  });

  it('works with negative declination values', () => {
    expect(trailingZeros('-05:30:15')).toBe('-05:30:15.000');
    expect(trailingZeros('-05:30:15.')).toBe('-05:30:15.000');
    expect(trailingZeros('-05:30:15.1')).toBe('-05:30:15.100');
  });

  it('returns non-sexagesimal input unchanged', () => {
    expect(trailingZeros('123.45')).toBe('123.45');
  });
});
