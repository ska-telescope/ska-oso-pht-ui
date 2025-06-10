import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import { countWords, generateId } from '@/utils/helpers.ts';

describe('PHT UI helper functions', () => {
  test('Generate ID', () => {
    assert.include(generateId('prsl-', 10), 'prsl-', 'ID contains prefix');
    expect(generateId('prsl-', 10)).toHaveLength(15);
  });

  test('Count words', () => {
    expect(countWords('An example sentence.')).toBe(3);
  });
});
