import Target from '@utils/types/target';
import {
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VELOCITY_TYPE,
  VelocityUnit
} from '@utils/constants';
import {
  PointingKind,
  RadialVelocityReferenceFrame,
  SolarSystemObjectName
} from '@/generated/models';
import { RADIAL_MOTION_TYPE, REFERENCE_COORDINATE_KIND, TargetInput } from './targets';

/*
 * TODO: Delete once nothing reads targets from the legacy store or as the legacy type.
 *
 * The legacy store, and the pages not yet moved to the form's targets, keep targets in the legacy
 * shape: a numeric coordinate kind and velocity type, a velocity unit code, and the velocity and
 * redshift as text.
 */

// The legacy store's velocity unit codes
const LEGACY_VELOCITY_UNIT: Record<VelocityUnit, number> = {
  'km / s': 0,
  'm / s': 1
};

const text = (value: number | null) => (value === null ? '' : String(value));

/** A form target in the legacy shape. */
export const legacyTargetFromForm = (target: TargetInput): Target => {
  const { referenceCoordinate: coord, radialMotion } = target;
  const isVelocity = radialMotion.type === RADIAL_MOTION_TYPE.VELOCITY;
  const coordinates = (): Pick<Target, 'kind' | 'raStr' | 'decStr' | 'l' | 'b'> => {
    switch (coord.kind) {
      case REFERENCE_COORDINATE_KIND.ICRS:
        return {
          kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
          raStr: coord.raStr,
          decStr: coord.decStr
        };
      case REFERENCE_COORDINATE_KIND.GALACTIC:
        return {
          kind: REFERENCE_COORDINATE_TYPE_GALACTIC.value,
          l: coord.l ?? undefined,
          b: coord.b ?? undefined
        };
      case REFERENCE_COORDINATE_KIND.SPECIAL:
        return { kind: REFERENCE_COORDINATE_TYPE_SSO.value };
    }
  };
  return {
    id: target.id,
    name: target.name,
    ...coordinates(),
    velType: isVelocity ? VELOCITY_TYPE.VELOCITY : VELOCITY_TYPE.REDSHIFT,
    vel: isVelocity ? text(radialMotion.velocity.value) : '',
    velUnit: LEGACY_VELOCITY_UNIT[isVelocity ? radialMotion.velocity.unit : 'km / s'],
    redshift: isVelocity ? '' : text(radialMotion.redshift),
    velocityDefinition: target.velocityDefinition,
    referenceFrame: target.referenceFrame,
    fieldPatternType: target.fieldPatternType
  };
};

export const legacyTargetsFromForm = (targets: TargetInput[]): Target[] =>
  targets.map(legacyTargetFromForm);

/** A legacy target in the form's shape. An empty velocity or redshift is 0, as the PDM saves it. */
export const formTargetFromLegacy = (target: Target): TargetInput => {
  const coordinates = (): TargetInput['referenceCoordinate'] => {
    switch (target.kind) {
      case REFERENCE_COORDINATE_TYPE_GALACTIC.value:
        return {
          kind: REFERENCE_COORDINATE_KIND.GALACTIC,
          l: target.l ?? null,
          b: target.b ?? null
        };
      case REFERENCE_COORDINATE_TYPE_SSO.value:
        return {
          kind: REFERENCE_COORDINATE_KIND.SPECIAL,
          name: target.name as SolarSystemObjectName
        };
      default:
        return {
          kind: REFERENCE_COORDINATE_KIND.ICRS,
          raStr: target.raStr ?? '',
          decStr: target.decStr ?? ''
        };
    }
  };
  const unit =
    (Object.keys(LEGACY_VELOCITY_UNIT) as VelocityUnit[]).find(
      (key) => LEGACY_VELOCITY_UNIT[key] === target.velUnit
    ) ?? 'km / s';
  return {
    id: target.id,
    name: target.name,
    referenceCoordinate: coordinates(),
    radialMotion:
      target.velType === VELOCITY_TYPE.REDSHIFT
        ? { type: RADIAL_MOTION_TYPE.REDSHIFT, redshift: Number(target.redshift || 0) }
        : {
            type: RADIAL_MOTION_TYPE.VELOCITY,
            velocity: { value: Number(target.vel || 0), unit }
          },
    velocityDefinition: target.velocityDefinition,
    referenceFrame: (target.referenceFrame ??
      RadialVelocityReferenceFrame.Lsrk) as RadialVelocityReferenceFrame,
    fieldPatternType: target.fieldPatternType ?? PointingKind.PointedMosaicParameters
  };
};

export const formTargetsFromLegacy = (targets: Target[] | null | undefined): TargetInput[] =>
  (targets ?? []).map(formTargetFromLegacy);
