import { z } from 'zod';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VEL_TYPES,
  VEL_UNITS,
  VELOCITY_TYPE
} from '@/utils/constants';
import type Target from '@/utils/types/target';
import type {
  PointingPatternParams,
  ReferenceCoordinateGalactic,
  ReferenceCoordinateICRS,
  ReferenceCoordinateSSO
} from '@/utils/types/target';
import type {
  GalacticCoordinates,
  ICRSCoordinates,
  PointingPatternParameters,
  SpecialCoordinates,
  Target as TargetTransport
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
    raReferenceFrame: z.string().optional(),
    raDefinition: z.string().optional(),
    velType: z.number().optional(),
    vel: z.string().optional(),
    velUnit: z.number().optional(),
    kind: z.number(),
    l: z.number().optional(),
    b: z.number().optional(),
    pmL: z.number().optional(),
    pmB: z.number().optional(),
    raStr: z.string().optional(),
    decStr: z.string().optional(),
    pmRa: z.number().optional(),
    pmDec: z.number().optional(),
    parallax: z.number().optional(),
    epoch: z.number().optional(),
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

const getVelType = (InDefinition: string) => {
  const velType = VEL_TYPES.find(
    (item) => item.label.toLowerCase() === InDefinition?.toLowerCase()
  )?.value;
  return velType ? velType : 1; // fallback
};

const getTargetType = (kind: string): number => {
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

export const targetsFromPdm = (inRec: TargetTransport[] = []): Target[] => {
  const results = [];
  for (let i = 0; i < inRec?.length; i++) {
    const e = inRec[i];
    const referenceCoordinate = e.reference_coordinate!.kind as string;
    const icrs = e.reference_coordinate as ICRSCoordinates;
    const radialVelocity = e.radial_velocity as Required<
      NonNullable<TargetTransport['radial_velocity']>
    >;
    const target: Partial<Target> = {
      kind: getTargetType(referenceCoordinate),
      epoch: icrs?.epoch,
      parallax: icrs?.parallax as number | undefined,
      id: e.target_id as string,
      name: e?.name as string,
      b: undefined,
      l: undefined,
      redshift: radialVelocity.redshift.toString(),
      raReferenceFrame: radialVelocity.reference_frame,
      raDefinition: radialVelocity.definition,
      velType: getVelType(radialVelocity.definition),
      vel: radialVelocity.quantity?.value?.toString(),
      velUnit: VEL_UNITS.find(
        (u) => u.label === radialVelocity?.quantity?.unit?.split(' ').join('')
      )?.value as number,
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
      }
    };
    /*------- reference coordinate properties --------------------- */

    switch (referenceCoordinate) {
      case REFERENCE_COORDINATE_TYPE_ICRS.label:
        target.raStr = icrs.ra_str;
        target.decStr = icrs.dec_str;
        target.pmRa = icrs.pm_ra as number | undefined;
        target.pmDec = icrs.pm_dec as number | undefined;
        break;

      case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
        target.l = (e.reference_coordinate as GalacticCoordinates).l;
        target.b = (e.reference_coordinate as GalacticCoordinates).b;
        target.pmL = (e.reference_coordinate as GalacticCoordinates).pm_l;
        target.pmB = (e.reference_coordinate as GalacticCoordinates).pm_b;
        break;

      case REFERENCE_COORDINATE_TYPE_SSO.label:
        break;

      default:
        throw new Error(`Unsupported coordinate type ${referenceCoordinate}`);
    }
    /*------- end of reference coordinate properties --------------------- */
    results.push(target);
  }
  return results as Target[];
};

/**************************** form → PDM *****************************/

const isVelocity = (type?: number) => type === VELOCITY_TYPE.VELOCITY;
const isRedshift = (type?: number) => type === VELOCITY_TYPE.REDSHIFT;

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
        pm_ra: (tar as TargetsType[number]).pmRa,
        pm_dec: (tar as TargetsType[number]).pmDec,
        epoch: (tar as TargetsType[number]).epoch,
        parallax: (tar as TargetsType[number]).parallax
      } as ICRSCoordinates;

    case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
      return {
        kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
        l: (tar as TargetsType[number]).l,
        b: (tar as TargetsType[number]).b,
        pm_l: (tar as TargetsType[number]).pmL,
        pm_b: (tar as TargetsType[number]).pmB,
        epoch: (tar as TargetsType[number]).epoch,
        parallax: (tar as TargetsType[number]).parallax
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
      definition: 'RADIO',
      reference_frame: tar.raReferenceFrame ?? 'LSRK',
      redshift: isRedshift(tar.velType) ? Number(tar.redshift) : 0
    } as TargetTransport['radial_velocity']
  }));
  return mappedTargets;
};
