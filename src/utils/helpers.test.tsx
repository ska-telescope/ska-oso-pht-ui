import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import { helpers, isVisible } from '@/utils/helpers.ts';

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
describe('isVisible', () => {
  it('returns true when declination is within visible range for SKA MID', () => {
    const result = isVisible('-20:00:00', false);
    expect(result).toBe(true);
  });

  it('returns true when declination is within visible range for SKA LOW', () => {
    const result = isVisible('-20:00:00', true);
    expect(result).toBe(true);
  });

  it('returns false for invalid declination input', () => {
    const result = isVisible('invalid', false);
    expect(result).toBe(false);
  });

  //TODO: Add tests for when declination is outside of visible range
});
