import { describe, expect, test } from 'vitest';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  VELOCITY_TYPE
} from '@/utils/constants';
import Target from '@/utils/types/target';
import {
  applyTargetEdit,
  getTargetEntrySchema,
  TARGET_ENTRY_DEFAULTS,
  targetEntryFromTarget
} from './targetEntry';

const icrsTarget: Target = {
  id: 'target-1',
  name: 'M2',
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  raStr: '21:33:27.020',
  decStr: '-00:49:23.700',
  velType: VELOCITY_TYPE.VELOCITY,
  vel: '10',
  velUnit: 0,
  redshift: ''
};

describe('target entry', () => {
  test('starts empty, with defaults the schema accepts', () => {
    expect(getTargetEntrySchema().safeParse(TARGET_ENTRY_DEFAULTS).success).toBe(true);
  });
});

describe('targetEntryFromTarget', () => {
  test('fills the entry from an ICRS target', () => {
    expect(targetEntryFromTarget(icrsTarget)).toEqual({
      ...TARGET_ENTRY_DEFAULTS,
      name: 'M2',
      coord1: '21:33:27.020',
      coord2: '-00:49:23.700',
      vel: '10'
    });
  });

  test('fills the coordinates from a galactic target', () => {
    const entry = targetEntryFromTarget({
      id: 'target-2',
      name: 'Galactic',
      kind: REFERENCE_COORDINATE_TYPE_GALACTIC.value,
      l: 12.5,
      b: -3.25
    });
    expect(entry.referenceCoordinates).toBe(REFERENCE_COORDINATE_TYPE_GALACTIC.value);
    expect(entry.coord1).toBe('12.5');
    expect(entry.coord2).toBe('-3.25');
  });
});

describe('applyTargetEdit', () => {
  const before = targetEntryFromTarget(icrsTarget);

  test('leaves the target unchanged when nothing was edited', () => {
    expect(applyTargetEdit(icrsTarget, before, before)).toEqual(icrsTarget);
  });

  test('applies only the edited fields, formatting coordinates as before', () => {
    const edited = applyTargetEdit(icrsTarget, before, {
      ...before,
      name: 'M2 edited',
      coord1: '1:00:00.000'
    });
    expect(edited).toEqual({ ...icrsTarget, name: 'M2 edited', raStr: '01:00:00.000' });
  });

  test('clears the velocity when switching to redshift', () => {
    const edited = applyTargetEdit(icrsTarget, before, {
      ...before,
      velType: VELOCITY_TYPE.REDSHIFT,
      redshift: '0.5'
    });
    expect(edited.velType).toBe(VELOCITY_TYPE.REDSHIFT);
    expect(edited.redshift).toBe('0.5');
    expect(edited.vel).toBe('');
  });

  test('does not change the original target', () => {
    applyTargetEdit(icrsTarget, before, { ...before, name: 'Changed' });
    expect(icrsTarget.name).toBe('M2');
  });
});
