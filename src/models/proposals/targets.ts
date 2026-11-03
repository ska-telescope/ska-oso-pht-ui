import { z } from 'zod';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VEL_UNITS,
  VELOCITY_DEFINITION,
  VELOCITY_TYPE,
  VelocityDefinition,
  VelocityType
} from '@/utils/constants';
import type Target from '@/utils/types/target';
import type {
  PointingPatternParams,
  ReferenceCoordinateGalactic,
  ReferenceCoordinateICRS,
  ReferenceCoordinateSSO
} from '@/utils/types/target';
import {
  type GalacticCoordinates,
  type ICRSCoordinates,
  type PointingPatternParameters,
  RadialVelocityDefinition,
  type SpecialCoordinates,
  type Target as TargetTransport
} from '@/generated/models';

// Schema for the proposal's targets. Structure only: see getProposalSchema.

const pointingPatternParamsSchema = z.object({
  kind: z.string(),
  offsetXArcsec: z.number(),
  offsetYArcsec: z.number()
});

export function getTargetSchema() {
  return z.object({
    id: z.string(),
    name: z.string(),
    redshift: z.string().optional(),
    referenceFrame: z.string().optional(),
    velocityDefinition: z.enum(VELOCITY_DEFINITION),
    velType: z.literal([VELOCITY_TYPE.VELOCITY, VELOCITY_TYPE.REDSHIFT]).optional(),
    vel: z.string().optional(),
    velUnit: z.number().optional(),
    kind: z.number(),
    l: z.number().optional(),
    b: z.number().optional(),
    raStr: z.string().optional(),
    decStr: z.string().optional(),
    // Loaded with both fields undefined when the PDM target has no pointing pattern
    pointingPattern: z
      .object({
        active: z.string().optional(),
        parameters: z.array(pointingPatternParamsSchema).optional()
      })
      .optional()
  });
}

export function getTargetsSchema() {
  return z.array(getTargetSchema());
}

export type TargetsType = z.input<ReturnType<typeof getTargetsSchema>>;

export const getTargetsValues = (proposal?: { targets?: TargetsType }): TargetsType =>
  proposal?.targets ?? [];

/*********************************************************** PDM mapping *********************************************************/

/**************************** PDM → form *****************************/

// The PDM keeps both a velocity and a redshift, so which one was entered comes from the data (as the
// ODT does): a redshift when it is set, otherwise a velocity
const getVelType = (redshift?: number): VelocityType =>
  redshift ? VELOCITY_TYPE.REDSHIFT : VELOCITY_TYPE.VELOCITY;

const velocityDefinitionFromPdm: Record<RadialVelocityDefinition, VelocityDefinition> = {
  [RadialVelocityDefinition.Radio]: VELOCITY_DEFINITION.RADIO,
  [RadialVelocityDefinition.Optical]: VELOCITY_DEFINITION.OPTICAL,
  [RadialVelocityDefinition.Relativistic]: VELOCITY_DEFINITION.RELATIVISTIC
};

const getCoordinateType = (kind: string): number => {
  switch (kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.label:
      return REFERENCE_COORDINATE_TYPE_ICRS.value;

    case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
      return REFERENCE_COORDINATE_TYPE_GALACTIC.value;

    case REFERENCE_COORDINATE_TYPE_SSO.label:
      return REFERENCE_COORDINATE_TYPE_SSO.value;

    default:
      throw new Error(`Unsupported coordinate type: ${kind}`);
  }
};

// Unsupported kinds have already been rejected by getCoordinateType, so anything else (SSO) adds nothing
const coordinateFieldsFromPdm = (
  coord: TargetTransport['reference_coordinate']
): Partial<Target> => {
  switch (coord!.kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.label: {
      const icrs = coord as ICRSCoordinates;
      return { raStr: icrs.ra_str, decStr: icrs.dec_str };
    }
    case REFERENCE_COORDINATE_TYPE_GALACTIC.label: {
      const galactic = coord as GalacticCoordinates;
      return { l: galactic.l, b: galactic.b };
    }
    default:
      return {};
  }
};

const targetFromPdm = (e: TargetTransport): Target => {
  const radialVelocity = e.radial_velocity as Required<
    NonNullable<TargetTransport['radial_velocity']>
  >;
  return {
    kind: getCoordinateType(e.reference_coordinate!.kind as string),
    id: e.target_id as string,
    name: e.name as string,
    // Galactic coordinates are optional in the PDM, so a target without them gets undefined - want to preserve the shape of the Target type, so explicitly set them to undefined (more elegant ideas welcome)
    b: undefined,
    l: undefined,
    redshift: radialVelocity.redshift.toString(),
    referenceFrame: radialVelocity.reference_frame,
    // Optional in the PDM, so a target without one gets the PDM default
    velocityDefinition:
      velocityDefinitionFromPdm[radialVelocity.definition ?? RadialVelocityDefinition.Radio],
    velType: getVelType(radialVelocity.redshift),
    vel: radialVelocity.quantity?.value?.toString(),
    velUnit: VEL_UNITS.find((u) => u.label === radialVelocity?.quantity?.unit?.split(' ').join(''))
      ?.value as number,
    pointingPattern: {
      active: e.pointing_pattern?.active as string,
      parameters: e.pointing_pattern?.parameters?.map((p) => {
        const params = p as PointingPatternParameters & {
          offset_x_arcsec: number;
          offset_y_arcsec: number;
        };
        return {
          kind: params.kind,
          offsetXArcsec: params.offset_x_arcsec,
          offsetYArcsec: params.offset_y_arcsec
        };
      }) as PointingPatternParams[]
    },
    ...coordinateFieldsFromPdm(e.reference_coordinate)
  } as Target;
};

export const targetsFromPdm = (inRec: TargetTransport[] = []): Target[] => inRec.map(targetFromPdm);

/**************************** form → PDM *****************************/

// Not used by the PHT yet, so not held in the form and always saved with these defaults:
// pmRa/pmDec (ICRS), pmL/pmB (Galactic), parallax and epoch
const UNUSED_PROPER_MOTION = 0;
const UNUSED_PARALLAX = 0;
const UNUSED_EPOCH = 2000;

const isVelocity = (type?: number) => type === VELOCITY_TYPE.VELOCITY;
const isRedshift = (type?: number) => type === VELOCITY_TYPE.REDSHIFT;

const velocityDefinitionToPdm: Record<VelocityDefinition, RadialVelocityDefinition> = {
  [VELOCITY_DEFINITION.RADIO]: RadialVelocityDefinition.Radio,
  [VELOCITY_DEFINITION.OPTICAL]: RadialVelocityDefinition.Optical,
  [VELOCITY_DEFINITION.RELATIVISTIC]: RadialVelocityDefinition.Relativistic
};

export const referenceCoordinateToPdm = (
  tar:
    | TargetsType[number]
    | ReferenceCoordinateICRS
    | ReferenceCoordinateGalactic
    | ReferenceCoordinateSSO
): ICRSCoordinates | GalacticCoordinates | SpecialCoordinates => {
  switch (tar.kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.value:
      return {
        kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
        ra_str: (tar as TargetsType[number]).raStr,
        dec_str: (tar as TargetsType[number]).decStr,
        pm_ra: UNUSED_PROPER_MOTION,
        pm_dec: UNUSED_PROPER_MOTION,
        epoch: UNUSED_EPOCH,
        parallax: UNUSED_PARALLAX
      } as ICRSCoordinates;

    case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
      return {
        kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
        l: (tar as TargetsType[number]).l,
        b: (tar as TargetsType[number]).b,
        pm_l: UNUSED_PROPER_MOTION,
        pm_b: UNUSED_PROPER_MOTION,
        epoch: UNUSED_EPOCH,
        parallax: UNUSED_PARALLAX
      } as GalacticCoordinates;

    case REFERENCE_COORDINATE_TYPE_SSO.value:
      return {
        kind: REFERENCE_COORDINATE_TYPE_SSO.label,
        name: (tar as TargetsType[number]).name
      } as SpecialCoordinates;
    default:
      throw new Error(`Unsupported reference coordinate kind: ${tar.kind}`);
  }
};

export const targetsToPdm = (targets: TargetsType): TargetTransport[] => {
  const mappedTargets = targets.map((tar) => ({
    name: tar.name,
    target_id: tar.id,
    reference_coordinate: referenceCoordinateToPdm(tar) as TargetTransport['reference_coordinate'],
    radial_velocity: {
      quantity: {
        value: isVelocity(tar.velType) ? Number(tar.vel) : 0,
        unit: VEL_UNITS.find((u) => u.value === Number(tar.velUnit))?.label ?? ''
      },
      definition: velocityDefinitionToPdm[tar.velocityDefinition],
      reference_frame: tar.referenceFrame ?? 'LSRK',
      redshift: isRedshift(tar.velType) ? Number(tar.redshift) : 0
    } as TargetTransport['radial_velocity']
  }));
  return mappedTargets;
};
