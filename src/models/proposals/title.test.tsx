import { describe, expect, test } from 'vitest';
import { getTitleSchema, titleFromPdm, titleToPdm } from './title';

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

describe('title PDM mapping', () => {
  test('reads the title from proposal_info', () => {
    expect(titleFromPdm({ title: 'From the ODA' })).toBe('From the ODA');
  });

  test('defaults to an empty title when proposal_info is missing', () => {
    expect(titleFromPdm(undefined)).toBe('');
  });

  test('writes the title as a proposal_info slice', () => {
    expect(titleToPdm('To the ODA')).toEqual({ title: 'To the ODA' });
  });
});
