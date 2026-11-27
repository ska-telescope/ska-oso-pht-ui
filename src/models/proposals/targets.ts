import { z } from 'zod';
import {
  SKY_DIRECTION_AXIS,
  SkyDirectionAxis,
  VELOCITY_UNITS,
  VelocityUnit
} from '@/utils/constants';
import phtTranslations from '@/locales/en/pht.json';
import {
  AngleUnits,
  type GalacticCoordinates,
  type ICRSCoordinates,
  PointingKind,
  type PointingPatternParameters,
  RadialVelocityDefinition,
  RadialVelocityReferenceFrame,
  SolarSystemObjectName,
  type SpecialCoordinates,
  type Target as TargetTransport
} from '@/generated/models';
import { required } from './required';

// The PDM's coordinate systems. A special coordinate is a solar system object, found by its name.
export const REFERENCE_COORDINATE_KIND = {
  ICRS: 'icrs',
  GALACTIC: 'galactic',
  SPECIAL: 'special'
} as const;
export type ReferenceCoordinateKind =
  (typeof REFERENCE_COORDINATE_KIND)[keyof typeof REFERENCE_COORDINATE_KIND];

// How a target's radial motion is given: a velocity, or a redshift
export const RADIAL_MOTION_TYPE = { VELOCITY: 'velocity', REDSHIFT: 'redshift' } as const;
export type RadialMotionType = (typeof RADIAL_MOTION_TYPE)[keyof typeof RADIAL_MOTION_TYPE];

/** The codes the sky direction checks return when a value is wrong. */
export const VALUE_ERROR = { FORMAT: '0', RANGE: '1' } as const;
export type ValueError = (typeof VALUE_ERROR)[keyof typeof VALUE_ERROR];

export function validateRightAscension(value: string): ValueError | null {
  const formatValid = /^\+?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }
  const arr = value.split(':');
  if (arr?.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) > 24) {
    return VALUE_ERROR.RANGE;
  }
  if (Number(arr[1]) > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[2]) >= 60) {
    return VALUE_ERROR.FORMAT;
  }
  if (Number(arr[0]) === 24 && (Number(arr[1]) > 0 || Number(arr[2]) > 0)) {
    return VALUE_ERROR.RANGE;
  }
  return null;
}

export function validateDeclination(value: string): ValueError | null {
  const formatValid = /^[-+]?\d{1,2}:\d{2}:\d{2}((\.?)|(\.\d+\s+|\.\d+))$/.test(value);
  if (!formatValid) {
    return VALUE_ERROR.FORMAT;
  }

  const arr = value.split(':');
  if (arr.length !== 3) {
    return VALUE_ERROR.FORMAT;
  }

  const hours = Number(arr[0]);
  const minutes = Number(arr[1]);
  const seconds = Number(arr[2].split('.')[0]);

  if (Math.abs(hours) > 90 || (Math.abs(hours) === 90 && (minutes > 0 || seconds > 0))) {
    return VALUE_ERROR.RANGE;
  }

  // explicitly treat these as a format rather than a range error
  // because they are not valid in the context of sky direction
  if (minutes > 59) {
    return VALUE_ERROR.FORMAT;
  }
  if (seconds > 59) {
    return VALUE_ERROR.FORMAT;
  }
  return null;
}

// The sky direction validators return the error for a wrong value, or null when it is fine
type CoordinateCheck = (value: string) => ValueError | null;

// The error shown for a coordinate, such as "Input formatted incorrectly"
export const coordinateErrorText = (axis: SkyDirectionAxis, error: ValueError): string =>
  phtTranslations.skyDirection.error[axis][error];

/**
 * A coordinate typed as text, which `check` validates. A failed check is an error on the field,
 * with the text for the axis and the error code as its message.
 */
const coordinateField = (axis: SkyDirectionAxis, check: CoordinateCheck) =>
  z
    .string()
    .trim()
    .superRefine(function reportCoordinateError(value, ctx) {
      const errorCode = check(value);
      if (errorCode !== null) {
        ctx.addIssue({ code: 'custom', message: coordinateErrorText(axis, errorCode) });
      }
    });

// The Galactic longitude has no range message of its own, so a value out of range is formatted
// incorrectly
const LONGITUDE_FORMAT = coordinateErrorText(SKY_DIRECTION_AXIS.LONGITUDE, VALUE_ERROR.FORMAT);
const LATITUDE_FORMAT = coordinateErrorText(SKY_DIRECTION_AXIS.LATITUDE, VALUE_ERROR.FORMAT);
const LATITUDE_RANGE = coordinateErrorText(SKY_DIRECTION_AXIS.LATITUDE, VALUE_ERROR.RANGE);

const referenceCoordinateSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal(REFERENCE_COORDINATE_KIND.ICRS),
    raStr: coordinateField(SKY_DIRECTION_AXIS.LONGITUDE, validateRightAscension),
    decStr: coordinateField(SKY_DIRECTION_AXIS.LATITUDE, validateDeclination)
  }),
  z.object({
    kind: z.literal(REFERENCE_COORDINATE_KIND.GALACTIC),
    l: required(
      z.number({ error: LONGITUDE_FORMAT }).min(0, LONGITUDE_FORMAT).lt(360, LONGITUDE_FORMAT)
    ),
    b: required(
      z.number({ error: LATITUDE_FORMAT }).min(-90, LATITUDE_RANGE).max(90, LATITUDE_RANGE)
    )
  }),
  z.object({
    kind: z.literal(REFERENCE_COORDINATE_KIND.SPECIAL),
    name: required(z.enum(SolarSystemObjectName, { error: phtTranslations.addTarget.valueError }))
  })
]);

const radialMotionValue = required(z.number({ error: phtTranslations.velocity.error }));

const radialMotionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(RADIAL_MOTION_TYPE.VELOCITY),
    velocity: z.object({ value: radialMotionValue, unit: z.enum(VELOCITY_UNITS) })
  }),
  z.object({
    type: z.literal(RADIAL_MOTION_TYPE.REDSHIFT),
    redshift: radialMotionValue
  })
]);

/** A target of the proposal. A solar system object's name is also the target's name. */
export function getTargetSchema() {
  return z.object({
    id: z.string(),
    name: z.string().trim().min(1, phtTranslations.addTarget.valueError),
    referenceCoordinate: referenceCoordinateSchema,
    radialMotion: radialMotionSchema,
    velocityDefinition: z.enum(RadialVelocityDefinition),
    referenceFrame: z.enum(RadialVelocityReferenceFrame),
    // Which of the PDM's pointing patterns the target is observed with. Only the type is held; its
    // parameters are made when the target is sent to the PDM.
    fieldPatternType: z.enum(PointingKind)
  });
}

export function getTargetsSchema() {
  return z.array(getTargetSchema());
}

// A target as the form holds it, which can be invalid
export type TargetInput = z.input<ReturnType<typeof getTargetSchema>>;

// A valid target, as the schema outputs it
export type TargetValues = z.output<ReturnType<typeof getTargetSchema>>;

type ReferenceCoordinateInput = TargetInput['referenceCoordinate'];
type RadialMotionInput = TargetInput['radialMotion'];

/** A new target's radial motion: no velocity, in km/s. */
export const newRadialMotion = (): RadialMotionInput => ({
  type: RADIAL_MOTION_TYPE.VELOCITY,
  velocity: { value: 0, unit: 'km / s' }
});

/**
 * A new target in a coordinate system, with nothing entered yet. A solar system object is seen
 * from the telescope, so its radial motion is topocentric and optical; other targets have the PDM
 * defaults. Every new target is a pointed mosaic of one pointing, on the target itself.
 */
export const newTarget = (id: string, kind: ReferenceCoordinateKind): TargetInput => {
  switch (kind) {
    case REFERENCE_COORDINATE_KIND.SPECIAL:
      return {
        id,
        name: '',
        referenceCoordinate: { kind, name: null },
        radialMotion: newRadialMotion(),
        velocityDefinition: RadialVelocityDefinition.Optical,
        referenceFrame: RadialVelocityReferenceFrame.Topocentric,
        fieldPatternType: PointingKind.PointedMosaicParameters
      };
    case REFERENCE_COORDINATE_KIND.GALACTIC:
      return {
        id,
        name: '',
        referenceCoordinate: { kind, l: null, b: null },
        radialMotion: newRadialMotion(),
        velocityDefinition: RadialVelocityDefinition.Radio,
        referenceFrame: RadialVelocityReferenceFrame.Lsrk,
        fieldPatternType: PointingKind.PointedMosaicParameters
      };
    case REFERENCE_COORDINATE_KIND.ICRS:
      return {
        id,
        name: '',
        referenceCoordinate: { kind, raStr: '', decStr: '' },
        radialMotion: newRadialMotion(),
        velocityDefinition: RadialVelocityDefinition.Radio,
        referenceFrame: RadialVelocityReferenceFrame.Lsrk,
        fieldPatternType: PointingKind.PointedMosaicParameters
      };
  }
};

/*********************************************************** PDM mapping *********************************************************/

/**************************** PDM → form *****************************/

const referenceCoordinateFromPdm = (
  coord: TargetTransport['reference_coordinate']
): ReferenceCoordinateInput => {
  switch (coord?.kind) {
    case REFERENCE_COORDINATE_KIND.ICRS: {
      const icrs = coord as ICRSCoordinates;
      return {
        kind: REFERENCE_COORDINATE_KIND.ICRS,
        raStr: icrs.ra_str ?? '',
        decStr: icrs.dec_str ?? ''
      };
    }
    case REFERENCE_COORDINATE_KIND.GALACTIC: {
      const galactic = coord as GalacticCoordinates;
      return { kind: REFERENCE_COORDINATE_KIND.GALACTIC, l: galactic.l, b: galactic.b };
    }
    case REFERENCE_COORDINATE_KIND.SPECIAL:
      return { kind: REFERENCE_COORDINATE_KIND.SPECIAL, name: (coord as SpecialCoordinates).name };
    default:
      throw new Error(`Unsupported coordinate type: ${coord?.kind}`);
  }
};

// The PDM keeps both a velocity and a redshift, so which one was entered comes from the data (as the
// ODT does): a redshift when it is set, otherwise a velocity. The unit is the PDM's, which the
// schema checks.
const radialMotionFromPdm = (
  radialVelocity: TargetTransport['radial_velocity']
): RadialMotionInput =>
  radialVelocity?.redshift
    ? { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: radialVelocity.redshift }
    : {
        type: RADIAL_MOTION_TYPE.VELOCITY,
        velocity: {
          value: radialVelocity?.quantity?.value ?? 0,
          unit: (radialVelocity?.quantity?.unit ?? 'km / s') as VelocityUnit
        }
      };

const targetFromPdm = (e: TargetTransport): TargetInput => ({
  id: e.target_id as string,
  name: e.name as string,
  referenceCoordinate: referenceCoordinateFromPdm(e.reference_coordinate),
  radialMotion: radialMotionFromPdm(e.radial_velocity),
  // Optional in the PDM, so a target without one gets the PDM default
  velocityDefinition: e.radial_velocity?.definition ?? RadialVelocityDefinition.Radio,
  // Optional in the PDM, so a target without one gets the PDM default
  referenceFrame: e.radial_velocity?.reference_frame ?? RadialVelocityReferenceFrame.Lsrk,
  // Optional in the PDM, so a target without one gets the PDM default
  fieldPatternType: e.pointing_pattern?.active ?? PointingKind.SinglePointParameters
});

export const targetsFromPdm = (inRec: TargetTransport[] = []): TargetInput[] =>
  inRec.map(targetFromPdm);

/**************************** form → PDM *****************************/

// Not used by the PHT yet, so not held in the form or sent; the PDM fills in its defaults:
// pmRa/pmDec (ICRS), pmL/pmB (Galactic), parallax and epoch

export const referenceCoordinateToPdm = (
  coord: ReferenceCoordinateInput
): ICRSCoordinates | GalacticCoordinates | SpecialCoordinates => {
  switch (coord.kind) {
    case REFERENCE_COORDINATE_KIND.ICRS:
      return { kind: coord.kind, ra_str: coord.raStr, dec_str: coord.decStr };
    case REFERENCE_COORDINATE_KIND.GALACTIC:
      return { kind: coord.kind, l: coord.l as number, b: coord.b as number };
    case REFERENCE_COORDINATE_KIND.SPECIAL:
      return { kind: coord.kind, name: coord.name as SolarSystemObjectName };
  }
};

// The PDM has both, so the one not in use is sent as 0
const radialVelocityToPdm = (target: TargetInput): TargetTransport['radial_velocity'] => {
  const { radialMotion } = target;
  const isVelocity = radialMotion.type === RADIAL_MOTION_TYPE.VELOCITY;
  return {
    quantity: isVelocity
      ? { value: radialMotion.velocity.value as number, unit: radialMotion.velocity.unit }
      : { value: 0, unit: 'km / s' },
    definition: target.velocityDefinition,
    reference_frame: target.referenceFrame,
    redshift: isVelocity ? 0 : (radialMotion.redshift as number)
  };
};

// The PHT doesn't set a pointing pattern's parameters yet, so they are made here: a pointed mosaic
// has one pointing with no offset, and any other type has the PDM's defaults.
// TODO: Send the parameters the user enters once the PHT has them.
const pointingParametersToPdm = (kind: PointingKind): PointingPatternParameters =>
  kind === PointingKind.PointedMosaicParameters
    ? { kind, offsets: [{ x: 0, y: 0 }], units: AngleUnits.Arcsec }
    : ({ kind } as PointingPatternParameters);

export const targetsToPdm = (targets: TargetInput[]): TargetTransport[] =>
  targets.map((target) => ({
    name: target.name,
    target_id: target.id,
    reference_coordinate: referenceCoordinateToPdm(
      target.referenceCoordinate
    ) as TargetTransport['reference_coordinate'],
    radial_velocity: radialVelocityToPdm(target),
    pointing_pattern: {
      active: target.fieldPatternType,
      parameters: [pointingParametersToPdm(target.fieldPatternType)]
    }
  }));
