import { describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';
import { inGroup } from './aaaUtils';

describe('AAA Utils', () => {
  test('inGroup', () => {
    expect(inGroup('Dummy string')).toBeTruthy();
  });
});
