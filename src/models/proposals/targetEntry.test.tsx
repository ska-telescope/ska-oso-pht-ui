import { describe, expect, test } from 'vitest';
import { getTargetEntrySchema, newTargetEntry } from './targetEntry';
import { newTarget, RADIAL_MOTION_TYPE, REFERENCE_COORDINATE_KIND, TargetInput } from './targets';
import phtTranslations from '@/locales/en/pht.json';

// The target rules themselves are tested with the target schema (targets.test.tsx)

const icrsTarget: TargetInput = {
  ...newTarget('target-1', REFERENCE_COORDINATE_KIND.ICRS),
  name: 'M2',
  referenceCoordinate: {
    kind: REFERENCE_COORDINATE_KIND.ICRS,
    raStr: '21:33:27.02',
    decStr: '-00:49:23.7'
  }
};

// The field errors the schema gives an entry, by path
const errorsFor = (values: TargetInput, targets?: Pick<TargetInput, 'id' | 'name'>[]) =>
  Object.fromEntries(
    (getTargetEntrySchema(targets).safeParse(values).error?.issues ?? []).map((issue) => [
      issue.path.join('.'),
      issue.message
    ])
  );

describe('target entry schema', () => {
  test('has the target rules', () => {
    expect(errorsFor(newTargetEntry())).toEqual({
      name: phtTranslations.addTarget.valueError,
      'referenceCoordinate.raStr': phtTranslations.skyDirection.error[1][0],
      'referenceCoordinate.decStr': phtTranslations.skyDirection.error[2][0]
    });
    expect(errorsFor(icrsTarget)).toEqual({});
  });

  test("rejects another target's name, ignoring case", () => {
    expect(errorsFor(icrsTarget, [{ id: 'target-2', name: 'm2' }])).toEqual({
      name: phtTranslations.addTarget.error
    });
    expect(errorsFor(icrsTarget, [{ id: 'target-2', name: 'M1' }])).toEqual({});
  });

  test('lets an edited target keep its own name', () => {
    expect(errorsFor(icrsTarget, [{ id: 'target-1', name: 'M2' }])).toEqual({});
  });

  test("shows a solar system object's repeated name on the object too", () => {
    const sso: TargetInput = {
      ...newTargetEntry(REFERENCE_COORDINATE_KIND.SPECIAL),
      name: 'Mars',
      referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.SPECIAL, name: 'Mars' }
    };
    expect(errorsFor(sso, [{ id: 'target-2', name: 'Mars' }])).toEqual({
      name: phtTranslations.addTarget.error,
      'referenceCoordinate.name': phtTranslations.addTarget.error
    });
  });
});

describe('newTargetEntry', () => {
  test('is a new target with a new ID', () => {
    const entry = newTargetEntry();
    expect(entry.id).toMatch(/^target-/);
    expect(newTargetEntry().id).not.toBe(entry.id);
    expect(entry).toEqual(newTarget(entry.id, REFERENCE_COORDINATE_KIND.ICRS));
  });

  test('keeps the values given', () => {
    const radialMotion = { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: 0 } as const;
    expect(
      newTargetEntry(REFERENCE_COORDINATE_KIND.GALACTIC, { id: 'target-1', radialMotion })
    ).toMatchObject({
      id: 'target-1',
      referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.GALACTIC, l: null, b: null },
      radialMotion
    });
  });
});
