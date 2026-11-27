import { describe, expect, test } from 'vitest';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import { targetsFromPdm } from './targets';
import {
  formTargetFromLegacy,
  formTargetsFromLegacy,
  legacyTargetFromForm,
  legacyTargetsFromForm
} from './legacyTargets';

const [icrs, galactic, sso] = targetsFromPdm(MockSlicesPdm.observation_info.targets);

describe('legacyTargetFromForm', () => {
  test('gives an ICRS target with a velocity in the legacy shape', () => {
    expect(legacyTargetFromForm(icrs)).toEqual({
      id: 'target-icrs',
      name: 'M2',
      kind: 0,
      raStr: '21:33:27.0200',
      decStr: '-00:49:23.700',
      velType: 0,
      vel: '25',
      velUnit: 0,
      redshift: '',
      velocityDefinition: 'RADIO',
      referenceFrame: 'LSRK',
      fieldPatternType: 'SinglePointParameters'
    });
  });

  test('gives a Galactic target with a redshift in the legacy shape', () => {
    expect(legacyTargetFromForm(galactic)).toMatchObject({
      kind: 1,
      l: 12.5,
      b: -3.25,
      velType: 1,
      vel: '',
      redshift: '0.5'
    });
  });

  test('gives a solar system object in the legacy shape', () => {
    expect(legacyTargetFromForm(sso)).toMatchObject({ kind: 2, name: 'Jupiter' });
  });

  test('gives the m / s unit its legacy code', () => {
    const target = legacyTargetFromForm({
      ...icrs,
      radialMotion: { type: 'velocity', velocity: { value: 5, unit: 'm / s' } }
    });
    expect(target.velUnit).toBe(1);
  });
});

describe('formTargetFromLegacy', () => {
  test.each([
    ['ICRS', icrs],
    ['Galactic', galactic],
    ['solar system object', sso]
  ])('gives back the %s form target', (_, target) => {
    expect(formTargetFromLegacy(legacyTargetFromForm(target))).toEqual(target);
  });

  test('reads an empty velocity as 0', () => {
    expect(formTargetFromLegacy({ ...legacyTargetFromForm(icrs), vel: '' }).radialMotion).toEqual({
      type: 'velocity',
      velocity: { value: 0, unit: 'km / s' }
    });
  });

  test('gives a legacy target without a field pattern type a pointed mosaic', () => {
    const { fieldPatternType: _, ...legacy } = legacyTargetFromForm(icrs);
    expect(formTargetFromLegacy(legacy).fieldPatternType).toBe('PointedMosaicParameters');
  });

  test('reads missing targets as an empty list', () => {
    expect(formTargetsFromLegacy(undefined)).toEqual([]);
    expect(legacyTargetsFromForm([])).toEqual([]);
  });
});
