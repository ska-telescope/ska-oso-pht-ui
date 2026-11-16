import { describe, expect, test } from 'vitest';
import { DETAILS, SCIENCE_CATEGORY } from '@/utils/constants';
import { detailsFromPdm, detailsToPdm, getDetailsSchema, getDetailsValues } from './details';

describe('details schema', () => {
  const schema = getDetailsSchema();

  test('requires an abstract', () => {
    expect(schema.safeParse({ abstract: '', scienceCategory: null }).success).toBe(false);
  });

  test('allows an unselected science category', () => {
    expect(
      schema.safeParse({ abstract: 'A scientific summary', scienceCategory: null }).success
    ).toBe(true);
  });

  test('enforces the abstract word limit', () => {
    const overLimit = 'word '.repeat(251).trim();
    expect(schema.safeParse({ abstract: overLimit, scienceCategory: null }).success).toBe(false);
  });

  test.each([2300, 2301])('validates an abstract with %s characters', (length) => {
    expect(schema.safeParse({ abstract: 'a'.repeat(length), scienceCategory: null }).success).toBe(
      length === 2300
    );
  });

  test.each(Object.values(SCIENCE_CATEGORY))('accepts science category %s', (scienceCategory) => {
    expect(schema.safeParse({ abstract: 'A scientific summary', scienceCategory }).success).toBe(
      true
    );
  });

  test.each([-1, 0, 15, 1.5, '1', 'Cosmology'])(
    'rejects invalid science category %s',
    (scienceCategory) => {
      expect(schema.safeParse({ abstract: 'A scientific summary', scienceCategory }).success).toBe(
        false
      );
    }
  );

  test('keeps the enum values aligned with the dropdown options', () => {
    expect(DETAILS.ScienceCategory.map(({ value }) => value)).toEqual(
      Object.values(SCIENCE_CATEGORY)
    );
  });
});

describe('details form values', () => {
  test('defaults missing fields and converts category labels to IDs', () => {
    expect(getDetailsValues()).toEqual({
      abstract: '',
      scienceCategory: null
    });
    expect(getDetailsValues({ scienceCategory: 'Cosmology' })).toEqual({
      abstract: '',
      scienceCategory: 1
    });
  });

  test.each(DETAILS.ScienceCategory)('normalizes category $label', ({ label, value }) => {
    expect(getDetailsValues({ scienceCategory: value }).scienceCategory).toBe(value);
    expect(getDetailsValues({ scienceCategory: label.toLowerCase() }).scienceCategory).toBe(value);
  });

  test('rejects an unknown numeric category when seeding the form', () => {
    expect(() => getDetailsValues({ scienceCategory: -1 })).toThrow();
  });
});

describe('details PDM mapping', () => {
  test('reads abstract and science category from proposal_info', () => {
    expect(
      detailsFromPdm({ abstract: 'A scientific summary', science_category: 'Cosmology' })
    ).toEqual({
      abstract: 'A scientific summary',
      scienceCategory: 1
    });
  });

  test('writes abstract and science category in PDM format', () => {
    expect(
      detailsToPdm({
        abstract: 'A scientific summary',
        scienceCategory: 1
      })
    ).toEqual({
      abstract: 'A scientific summary',
      science_category: DETAILS.ScienceCategory[0].label
    });
  });

  test('defaults missing proposal metadata without an observing mode', () => {
    expect(detailsFromPdm()).toEqual({
      abstract: '',
      scienceCategory: null
    });
  });

  test.each(DETAILS.ScienceCategory)('round-trips category $label', ({ label, value }) => {
    const details = detailsFromPdm({ abstract: 'A scientific summary', science_category: label });
    expect(details.scienceCategory).toBe(value);
    expect(detailsToPdm(details).science_category).toBe(label);
  });

  test.each(['', 'word '.repeat(251).trim(), 'a'.repeat(2301)])(
    'allows saving an incomplete abstract',
    (abstract) => {
      expect(detailsToPdm({ abstract, scienceCategory: null })).toEqual({
        abstract,
        science_category: undefined
      });
    }
  );
});
