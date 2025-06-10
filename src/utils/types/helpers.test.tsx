import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import {
  calculateVelocity,
  countWords,
  generateId,
  getMinimumChannelWidth
} from '@/utils/helpers.ts';

describe('PHT UI helper functions', () => {
  test('Generate ID', () => {
    assert.include(generateId('prsl-', 10), 'prsl-', 'ID contains prefix');
    expect(generateId('prsl-', 10)).toHaveLength(15);
  });

  test('Count words', () => {
    expect(countWords('An example sentence.')).toBe(3);
  });

  test('Minimum channel width, telescope MID, value 1', () => {
    expect(getMinimumChannelWidth(1)).toBe(13440);
  });

  test('Minimum channel width, telescope LOW, value 2', () => {
    expect(getMinimumChannelWidth(2)).toBe(5425.347222222223);
  });

  test('Velocity', () => {
    expect(calculateVelocity(200, 300, 2)).toBe('199861.64 km/s');
  });
});
