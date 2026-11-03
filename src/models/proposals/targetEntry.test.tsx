import { describe, expect, test } from 'vitest';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VELOCITY_DEFINITION,
  VELOCITY_TYPE
} from '@/utils/constants';
import Target from '@/utils/types/target';
import {
  applyTargetEdit,
  getTargetEntrySchema,
  TARGET_ENTRY_DEFAULTS,
  targetEntryFromTarget,
  TargetEntryType
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
  velocityDefinition: VELOCITY_DEFINITION.RADIO,
  redshift: ''
};

// The field errors the schema gives an entry, as translation keys
const errorsFor = (entry: Partial<TargetEntryType>, takenNames?: string[]) =>
  Object.fromEntries(
    (
      getTargetEntrySchema(takenNames).safeParse({ ...TARGET_ENTRY_DEFAULTS, ...entry }).error
        ?.issues ?? []
    ).map((issue) => [issue.path[0], issue.message])
  );

const validIcrs = { name: 'M2', coord1: '21:33:27.02', coord2: '-00:49:23.7' };

describe('target entry', () => {
  test('starts empty, wanting a name and coordinates', () => {
    expect(errorsFor({})).toEqual({
      name: 'addTarget.valueError',
      coord1: 'skyDirection.error.1.0',
      coord2: 'skyDirection.error.2.0'
    });
  });

  test('accepts a complete ICRS entry', () => {
    expect(errorsFor(validIcrs)).toEqual({});
  });
});

describe('target entry schema', () => {
  test('rejects a name of only spaces', () => {
    expect(errorsFor({ ...validIcrs, name: '  ' })).toEqual({ name: 'addTarget.valueError' });
  });

  test('rejects a name already in the proposal, ignoring case', () => {
    expect(errorsFor(validIcrs, ['m2'])).toEqual({ name: 'addTarget.error' });
    expect(errorsFor(validIcrs, ['M1'])).toEqual({});
  });

  test('reports the name and coordinate errors together', () => {
    expect(errorsFor({ coord1: '1:0:0' }, ['m2'])).toEqual({
      name: 'addTarget.valueError',
      coord1: 'skyDirection.error.1.0',
      coord2: 'skyDirection.error.2.0'
    });
  });

  test('gives the ICRS format and range errors', () => {
    expect(errorsFor({ ...validIcrs, coord1: '1:0:0', coord2: '91:00:00' })).toEqual({
      coord1: 'skyDirection.error.1.0',
      coord2: 'skyDirection.error.2.1'
    });
  });

  test('checks Galactic coordinates as numbers', () => {
    const galactic = { ...validIcrs, kind: REFERENCE_COORDINATE_TYPE_GALACTIC.value };
    expect(errorsFor({ ...galactic, coord1: '12.5', coord2: '-3.25' })).toEqual({});
    expect(errorsFor({ ...galactic, coord1: '400', coord2: '95' })).toEqual({
      coord1: 'skyDirection.error.1.0',
      coord2: 'skyDirection.error.2.1'
    });
  });

  test('does not check coordinates or radial motion for a solar system object', () => {
    expect(
      errorsFor({ name: 'Mars', kind: REFERENCE_COORDINATE_TYPE_SSO.value, vel: 'abc' })
    ).toEqual({});
  });

  test('checks whichever of velocity and redshift is in use', () => {
    expect(errorsFor({ ...validIcrs, vel: 'abc' })).toEqual({ vel: 'velocity.error' });
    expect(errorsFor({ ...validIcrs, redshift: 'abc' })).toEqual({});
    expect(errorsFor({ ...validIcrs, velType: VELOCITY_TYPE.REDSHIFT, redshift: 'abc' })).toEqual({
      redshift: 'velocity.error'
    });
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
      b: -3.25,
      velocityDefinition: VELOCITY_DEFINITION.RADIO
    });
    expect(entry.kind).toBe(REFERENCE_COORDINATE_TYPE_GALACTIC.value);
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
