import { describe, expect, test } from 'vitest';
import { getTitleSchema } from './title';

describe('title schema', () => {
  const schema = getTitleSchema();

  test('requires a title', () => {
    expect(schema.safeParse('').success).toBe(false);
  });

  test('rejects unsupported characters', () => {
    expect(schema.safeParse('A title with @').success).toBe(false);
  });

  test('rejects titles above the word limit', () => {
    expect(schema.safeParse('word '.repeat(21).trim()).success).toBe(false);
  });

  test('accepts supported title and latex characters', () => {
    expect(schema.safeParse('A title with $x^2$ / data').success).toBe(true);
  });
});
