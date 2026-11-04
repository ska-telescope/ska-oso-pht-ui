import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FIELD_PATTERN_POINTING_CENTRES,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VELOCITY_TYPE
} from '@/utils/constants';
import { leadZero } from '@/utils/helpers';
import {
  validateRadialMotion,
  isValidGalacticLongitude,
  validateRightAscension,
  validateGalacticLatitude,
  validateDeclination
} from '@/utils/validation/validation';
import type Target from '@/utils/types/target';
import { getTargetSchema } from './targets';

// A target the user is still entering, before it becomes part of the proposal. It is held in a
// small form local to the entry, not the global proposal form, so it is not saved and goes when
// the entry closes, as before.

const isSameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// The sky direction validators return  ('0' for a badly formatted value, '1'
// for one out of range or null when the value is fine
const FORMAT_ERROR = '0';
type CoordinateAxis = 1 | 2;

type CoordinateCheck = (value: string) => string | null;
function coordinateErrorKey(axis: CoordinateAxis, code: string): string {
  return `skyDirection.error.${axis}.${code}`;
}

function checkGalacticLongitude(value: string): string | null {
  return isValidGalacticLongitude(value) ? null : FORMAT_ERROR;
}

/**
 * A coordinate field, typed as text, that `check` validates. A failed check becomes an error on
 * the field, with the translation key for the axis and the error code as its message.
 */
function coordinateField(axis: CoordinateAxis, check: CoordinateCheck) {
  return z.string().superRefine(function reportCoordinateError(value, ctx) {
    const errorCode = check(value);
    if (errorCode !== null) {
      ctx.addIssue({ code: 'custom', message: coordinateErrorKey(axis, errorCode) });
    }
  });
}

// coord1/coord2 mean RA/Dec for ICRS and l/b for Galactic, so each coordinate system checks them
// its own way; they become raStr/decStr or l/b when the target is added
const ICRS_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_ICRS.value),
  coord1: coordinateField(1, validateRightAscension),
  coord2: coordinateField(2, validateDeclination)
};
const GALACTIC_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_GALACTIC.value),
  coord1: coordinateField(1, checkGalacticLongitude),
  coord2: coordinateField(2, validateGalacticLatitude)
};
// A solar system object is found by name, so it has no coordinates to check
const SSO_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_SSO.value),
  coord1: z.string(),
  coord2: z.string()
};

/**
 * The fields shared with a saved target come from its schema, all required while entering; the
 * coordinates are checked by coordinate system. Error messages are translation keys. `takenNames`
 * are the names of the targets already in the proposal, so a new target can't repeat one.
 */
export function getTargetEntrySchema(takenNames: string[] = []) {
  const common = getTargetSchema()
    .pick({ name: true, velType: true, vel: true, velUnit: true, redshift: true })
    .required()
    .extend({
      // Shown in the entry only; not yet saved with the target
      fieldPattern: z.string()
    });

  return z
    .discriminatedUnion('kind', [
      common.extend(ICRS_COORDINATES),
      common.extend(GALACTIC_COORDINATES),
      common.extend(SSO_COORDINATES)
    ])
    .superRefine((entry, ctx) => {
      const fail = (path: keyof TargetEntryType, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (!entry.name.trim()) {
        fail('name', 'addTarget.valueError');
      } else if (takenNames.some((taken) => isSameName(taken, entry.name))) {
        fail('name', 'addTarget.error');
      }

      // Velocity or redshift, whichever is in use; a solar system object has neither
      const radialMotion = entry.velType === VELOCITY_TYPE.VELOCITY ? 'vel' : 'redshift';
      if (
        entry.kind !== REFERENCE_COORDINATE_TYPE_SSO.value &&
        entry[radialMotion] &&
        validateRadialMotion(entry[radialMotion])
      ) {
        fail(radialMotion, 'velocity.error');
      }
    });
}

export type TargetEntryType = z.input<ReturnType<typeof getTargetEntrySchema>>;

export const TARGET_ENTRY_DEFAULTS: TargetEntryType = {
  kind: REFERENCE_COORDINATE_TYPE_ICRS.value,
  name: '',
  coord1: '',
  coord2: '',
  velType: VELOCITY_TYPE.VELOCITY,
  vel: '',
  velUnit: 0,
  redshift: '',
  fieldPattern: FIELD_PATTERN_POINTING_CENTRES
};

interface TargetEntryContext {
  takenNames?: string[];
}

/**
 * The local form for one target entry, validated by its schema. Pass the names already in the
 * proposal when adding a target; leave them out when editing one.
 */
export const useTargetEntryForm = (takenNames?: string[]) =>
  useForm<TargetEntryType, TargetEntryContext>({
    // Each field is checked as it changes
    mode: 'onChange',
    defaultValues: { ...TARGET_ENTRY_DEFAULTS },
    // The names change as targets are added, so they reach the schema through the context
    context: { takenNames },
    resolver: (values, context, options) =>
      zodResolver(getTargetEntrySchema(context?.takenNames))(values, context, options)
  });

/** An entry holding an existing target's values, for the edit dialog. */
export const targetEntryFromTarget = (target: Target): TargetEntryType => {
  const kind = target.kind ?? REFERENCE_COORDINATE_TYPE_ICRS.value;
  const isICRS = kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
  const coordinate = (icrs?: string, galactic?: number) =>
    isICRS ? (icrs ?? '') : galactic != null ? String(galactic) : '';
  return {
    ...TARGET_ENTRY_DEFAULTS,
    kind,
    name: target.name ?? '',
    coord1: coordinate(target.raStr, target.l),
    coord2: coordinate(target.decStr, target.b),
    velType: target.velType ?? TARGET_ENTRY_DEFAULTS.velType,
    vel: target.vel ?? '',
    velUnit: target.velUnit ?? TARGET_ENTRY_DEFAULTS.velUnit,
    redshift: target.redshift ?? ''
  };
};

/**
 * Applies the fields changed in the edit dialog to the target, leaving the others as they were,
 * then clears whichever of velocity and redshift the velocity type does not use.
 */
export const applyTargetEdit = (
  target: Target,
  before: TargetEntryType,
  after: TargetEntryType
): Target => {
  const changed = (field: keyof TargetEntryType) => before[field] !== after[field];
  const isICRS = after.kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
  const edited: Target = { ...target };
  if (changed('name')) edited.name = after.name;
  if (changed('kind')) edited.kind = after.kind;
  if (changed('coord1')) {
    if (isICRS) edited.raStr = leadZero(after.coord1).toString();
    else edited.l = parseFloat(after.coord1);
  }
  if (changed('coord2')) {
    if (isICRS) edited.decStr = leadZero(after.coord2).toString();
    else edited.b = parseFloat(after.coord2);
  }
  if (changed('velType')) edited.velType = after.velType;
  if (changed('vel')) edited.vel = after.vel;
  if (changed('velUnit')) edited.velUnit = after.velUnit;
  if (changed('redshift')) edited.redshift = after.redshift;

  if (edited.velType === VELOCITY_TYPE.VELOCITY) {
    edited.redshift = '';
  } else {
    edited.vel = '';
  }
  return edited;
};
