import { describe, expect, test } from 'vitest';
import {
  MockProposalBackend,
  MockProposalBackendZoom
} from '@services/axios/get/getProposal/mockProposalBackend.tsx';
import { ProposalBackend } from '@utils/types/proposal.tsx';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import {
  getTargetSchema,
  getTargetsSchema,
  newTarget,
  RADIAL_MOTION_TYPE,
  REFERENCE_COORDINATE_KIND,
  TargetInput,
  targetsFromPdm,
  targetsToPdm,
  validateDeclination,
  validateRightAscension
} from './targets';
import phtTranslations from '@/locales/en/pht.json';

const mockPdms = [
  ['MockSlicesPdm', MockSlicesPdm],
  ['MockProposalBackend', MockProposalBackend as unknown as ProposalBackend],
  ['MockProposalBackendZoom', MockProposalBackendZoom as unknown as ProposalBackend]
] as const;

const icrs: TargetInput = {
  ...newTarget('target-1', REFERENCE_COORDINATE_KIND.ICRS),
  name: 'M2',
  referenceCoordinate: {
    kind: REFERENCE_COORDINATE_KIND.ICRS,
    raStr: '21:33:27.02',
    decStr: '-00:49:23.7'
  }
};

// The field errors the schema gives a target, by path
const errorsFor = (target: TargetInput) =>
  Object.fromEntries(
    (getTargetSchema().safeParse(target).error?.issues ?? []).map((issue) => [
      issue.path.join('.'),
      issue.message
    ])
  );

describe('targets schema', () => {
  test.each(mockPdms)('accepts the targets loaded from %s', (_, pdm) => {
    const targets = targetsFromPdm(pdm.observation_info?.targets);
    expect(targets).not.toHaveLength(0);
    expect(getTargetsSchema().safeParse(targets).error).toBeUndefined();
  });

  test('accepts a proposal with no targets', () => {
    expect(getTargetsSchema().safeParse([]).success).toBe(true);
  });

  test('accepts a complete target', () => {
    expect(errorsFor(icrs)).toEqual({});
  });

  test('wants a name', () => {
    expect(errorsFor({ ...icrs, name: ' ' })).toEqual({
      name: phtTranslations.addTarget.valueError
    });
  });

  test('checks the ICRS coordinates', () => {
    expect(
      errorsFor({
        ...icrs,
        referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.ICRS, raStr: '25:00:00', decStr: '' }
      })
    ).toEqual({
      'referenceCoordinate.raStr': phtTranslations.skyDirection.error[1][1],
      'referenceCoordinate.decStr': phtTranslations.skyDirection.error[2][0]
    });
  });

  test('wants Galactic coordinates in range', () => {
    const galactic = (l: number | null, b: number | null): TargetInput => ({
      ...icrs,
      referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.GALACTIC, l, b }
    });
    expect(errorsFor(galactic(12.5, -3.25))).toEqual({});
    expect(errorsFor(galactic(null, null))).toEqual({
      'referenceCoordinate.l': phtTranslations.skyDirection.error[1][0],
      'referenceCoordinate.b': phtTranslations.skyDirection.error[2][0]
    });
    expect(errorsFor(galactic(360, 91))).toEqual({
      'referenceCoordinate.l': phtTranslations.skyDirection.error[1][0],
      'referenceCoordinate.b': phtTranslations.skyDirection.error[2][1]
    });
  });

  test('wants a solar system object to be named', () => {
    const sso = newTarget('target-1', REFERENCE_COORDINATE_KIND.SPECIAL);
    expect(errorsFor({ ...sso, name: 'Mars' })).toEqual({
      'referenceCoordinate.name': phtTranslations.addTarget.valueError
    });
    expect(
      errorsFor({
        ...sso,
        name: 'Mars',
        referenceCoordinate: { kind: REFERENCE_COORDINATE_KIND.SPECIAL, name: 'Mars' }
      })
    ).toEqual({});
  });

  test('wants the velocity or redshift in use', () => {
    expect(
      errorsFor({
        ...icrs,
        radialMotion: {
          type: RADIAL_MOTION_TYPE.VELOCITY,
          velocity: { value: null, unit: 'km / s' }
        }
      })
    ).toEqual({ 'radialMotion.velocity.value': phtTranslations.velocity.error });
    expect(
      errorsFor({ ...icrs, radialMotion: { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: null } })
    ).toEqual({ 'radialMotion.redshift': phtTranslations.velocity.error });
  });
});

describe('newTarget', () => {
  test('gives a solar system object a topocentric, optical radial motion of 0', () => {
    expect(newTarget('target-1', REFERENCE_COORDINATE_KIND.SPECIAL)).toMatchObject({
      radialMotion: {
        type: RADIAL_MOTION_TYPE.VELOCITY,
        velocity: { value: 0, unit: 'km / s' }
      },
      velocityDefinition: 'OPTICAL',
      referenceFrame: 'TOPOCENTRIC'
    });
  });

  test.each([REFERENCE_COORDINATE_KIND.ICRS, REFERENCE_COORDINATE_KIND.GALACTIC])(
    'gives a %s target the PDM defaults',
    (kind) => {
      expect(newTarget('target-1', kind)).toMatchObject({
        velocityDefinition: 'RADIO',
        referenceFrame: 'LSRK'
      });
    }
  );
});

describe('targets PDM mapping', () => {
  test.each(mockPdms)('round-trips %s through the form without further change', (_, pdm) => {
    const saved = targetsToPdm(targetsFromPdm(pdm.observation_info?.targets));
    expect(targetsToPdm(targetsFromPdm(saved))).toEqual(saved);
  });

  // Proper motion, parallax and epoch are not used by the PHT, so they are not sent; the PDM
  // fills in its defaults
  const UNUSED_FIELDS = ['pm_ra', 'pm_dec', 'pm_l', 'pm_b', 'parallax', 'epoch'];

  // Saving gives back every field that was loaded except the pointing pattern, whose parameters
  // are made on saving (tested below), and the unused coordinate fields above
  const savedFrom = (pdm: ProposalBackend) =>
    structuredClone(pdm.observation_info.targets ?? []).map(
      ({ pointing_pattern: _, ...target }) => ({
        ...target,
        reference_coordinate: Object.fromEntries(
          Object.entries(target.reference_coordinate ?? {}).filter(
            ([field]) => !UNUSED_FIELDS.includes(field)
          )
        ) as typeof target.reference_coordinate
      })
    );

  test.each(mockPdms)('saves the targets of %s', (_, pdm) => {
    const saved = targetsToPdm(targetsFromPdm(pdm.observation_info.targets)).map(
      ({ pointing_pattern: _, ...target }) => target
    );
    expect(saved).toEqual(savedFrom(pdm));
  });

  test('loads each coordinate system with its own coordinates', () => {
    const [icrsTarget, galactic, sso] = targetsFromPdm(MockSlicesPdm.observation_info.targets);
    expect(icrsTarget.referenceCoordinate).toEqual({
      kind: 'icrs',
      raStr: '21:33:27.0200',
      decStr: '-00:49:23.700'
    });
    expect(galactic.referenceCoordinate).toEqual({ kind: 'galactic', l: 12.5, b: -3.25 });
    expect(sso.referenceCoordinate).toEqual({ kind: 'special', name: 'Jupiter' });
  });

  test('loads a target with a redshift as a redshift, and any other as a velocity', () => {
    const [velocity, redshift] = targetsFromPdm(MockSlicesPdm.observation_info.targets);
    expect(velocity.radialMotion).toEqual({
      type: RADIAL_MOTION_TYPE.VELOCITY,
      velocity: { value: 25, unit: 'km / s' }
    });
    expect(redshift.radialMotion).toEqual({ type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: 0.5 });
  });

  test('saves the radial motion not in use as 0', () => {
    const [saved] = targetsToPdm([
      { ...icrs, radialMotion: { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: 0.5 } }
    ]);
    expect(saved.radial_velocity).toMatchObject({
      quantity: { value: 0, unit: 'km / s' },
      redshift: 0.5
    });
  });

  test('loads a target without a velocity definition with the PDM default', () => {
    const [pdmTarget] = MockSlicesPdm.observation_info.targets ?? [];
    const { definition: _, ...noDefinition } = pdmTarget.radial_velocity ?? {};
    const [target] = targetsFromPdm([{ ...pdmTarget, radial_velocity: noDefinition }]);
    expect(target.velocityDefinition).toBe('RADIO');
  });

  test('loads a target without a reference frame with the PDM default', () => {
    const [pdmTarget] = MockSlicesPdm.observation_info.targets ?? [];
    const { reference_frame: _, ...noFrame } = pdmTarget.radial_velocity ?? {};
    const [target] = targetsFromPdm([{ ...pdmTarget, radial_velocity: noFrame }]);
    expect(target.referenceFrame).toBe('LSRK');
  });

  test("loads a target's field pattern type, or the PDM default when it has none", () => {
    const [withPattern, withoutPattern] = targetsFromPdm(MockSlicesPdm.observation_info.targets);
    expect(withPattern.fieldPatternType).toBe('SinglePointParameters');
    expect(withoutPattern.fieldPatternType).toBe('SinglePointParameters');
    const [mosaic] = targetsFromPdm([
      {
        ...MockSlicesPdm.observation_info.targets![0],
        pointing_pattern: { active: 'FivePointParameters' }
      }
    ]);
    expect(mosaic.fieldPatternType).toBe('FivePointParameters');
  });

  test('gives a new target a pointed mosaic', () => {
    expect(icrs.fieldPatternType).toBe('PointedMosaicParameters');
  });

  test('saves a pointed mosaic with one pointing on the target', () => {
    const [saved] = targetsToPdm([icrs]);
    expect(saved.pointing_pattern).toEqual({
      active: 'PointedMosaicParameters',
      parameters: [{ kind: 'PointedMosaicParameters', offsets: [{ x: 0, y: 0 }], units: 'arcsec' }]
    });
  });

  test("saves any other field pattern type with the PDM's defaults", () => {
    const [saved] = targetsToPdm([{ ...icrs, fieldPatternType: 'SinglePointParameters' }]);
    expect(saved.pointing_pattern).toEqual({
      active: 'SinglePointParameters',
      parameters: [{ kind: 'SinglePointParameters' }]
    });
  });

  test('reads missing targets as an empty list', () => {
    expect(targetsFromPdm(undefined)).toEqual([]);
  });
});

describe('validateRightAscension', () => {
  test('validates correct equatorial format', () => {
    expect(validateRightAscension('12:34:56')).toBeNull();
    expect(validateRightAscension('2:34:56')).toBeNull();
    expect(validateRightAscension('+12:34:56')).toBeNull();
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateRightAscension('123:45:67')).toBe('0'); // Invalid hours
    expect(validateRightAscension('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateRightAscension('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateRightAscension('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateRightAscension('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateRightAscension('12:34')).toBe('0'); // Missing seconds
    expect(validateRightAscension('12:34:')).toBe('0'); // Missing seconds value
    expect(validateRightAscension('')).toBe('0'); // Empty string
    expect(validateRightAscension('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateRightAscension('12:34:56.789')).toBeNull(); // Valid fractional seconds
    expect(validateRightAscension('12:34:56.789 ')).toBeNull(); // Valid with trailing whitespace
    expect(validateRightAscension('12:34:56.')).toBeNull(); // Valid trailing dot
  });

  test('rejects out-of-range values', () => {
    expect(validateRightAscension('91:00:00')).toBe('1'); // Hours out of range
    expect(validateRightAscension('-91:00:00')).toBe('0'); // Negative sign → format error
    expect(validateRightAscension('12:60:00')).toBe('0'); // Minutes > 59 is a format error (hours are fine)
    expect(validateRightAscension('12:34:60')).toBe('0'); // Seconds >= 60 is a format error (hours are fine)
  });

  test('rejects negative values', () => {
    expect(validateRightAscension('-12:34:56')).toBe('0');
    expect(validateRightAscension('-12:34:56.789')).toBe('0');
  });

  test('rejects targets not visible', () => {
    expect(validateRightAscension('50:00:00')).toBe('1');
    expect(validateRightAscension('89:50:00')).toBe('1');
    expect(validateRightAscension('90:00:00')).toBe('1');
  });
});

describe('validateDeclination', () => {
  test('validates correct equatorial format', () => {
    expect(validateDeclination('12:34:56')).toBe(null);
    expect(validateDeclination('2:34:56')).toBe(null);
    expect(validateDeclination('-12:34:56')).toBe(null);
    expect(validateDeclination('+12:34:56')).toBe(null);
    expect(validateDeclination('-90:00:00')).toBe(null);
  });

  test('rejects incorrect equatorial format', () => {
    expect(validateDeclination('123:45:67')).toBe('0'); // Invalid hours
    expect(validateDeclination('12:345:67')).toBe('0'); // Invalid minutes
    expect(validateDeclination('12:3:67')).toBe('0'); // Invalid minutes
    expect(validateDeclination('12:34:567')).toBe('0'); // Invalid seconds
    expect(validateDeclination('12:34:5')).toBe('0'); // Invalid seconds
    expect(validateDeclination('12:34')).toBe('0'); // Missing seconds
    expect(validateDeclination('12:34:')).toBe('0'); // Missing seconds value
    expect(validateDeclination('')).toBe('0'); // Empty string
    expect(validateDeclination('abc:def:ghi')).toBe('0'); // Non-numeric input
  });

  test('validates fractional seconds', () => {
    expect(validateDeclination('12:34:56.789')).toBe(null); // Valid fractional seconds
    expect(validateDeclination('-12:34:56.789')).toBe(null); // Valid negative fractional seconds
    expect(validateDeclination('-90:00:00.0')).toBe(null); // Valid edge case with fractional seconds
    expect(validateDeclination('12:34:56.789 ')).toBe(null); // Valid trailing whitespace
    expect(validateDeclination('-12:34:56.789 ')).toBe(null); // Valid trailing whitespace
    expect(validateDeclination('12:34:56.')).toBe(null); // Valid trailing dot
    expect(validateDeclination('-12:34:56.')).toBe(null); // Valid negative trailing dot
  });

  test('rejects out-of-range values', () => {
    expect(validateDeclination('91:00:00')).toBe('1'); // Hours out of range
    expect(validateDeclination('-91:00:00')).toBe('1'); // Negative hours out of range
    expect(validateDeclination('12:60:00')).toBe('0'); // Invalid format (60 min has no meaning in context of sky direction)
    expect(validateDeclination('12:34:60')).toBe('0'); // Invalid format (60 sec has no meaning in context of sky direction)
  });
});
