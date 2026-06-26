import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import {
  calculateVelocity,
  countWords,
  generateId
} from '@/utils/helpers.ts';

describe('PHT UI helper functions', () => {
  test('Generate ID', () => {
    assert.include(generateId('prsl-', 10), 'prsl-', 'ID contains prefix');
    expect(generateId('prsl-', 10)).toHaveLength(15);
  });

  test('Count words', () => {
    expect(countWords('An example sentence.')).toBe(3);
  });

  test('Velocity', () => {
    expect(calculateVelocity(200, 300, 2)).toBe('199861.64 km/s');
  });
});
