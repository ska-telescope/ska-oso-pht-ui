import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FIELD_PATTERN_POINTING_CENTRES,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  SKY_DIRECTION_AXIS,
  SkyDirectionAxis,
  VELOCITY_UNIT,
  VELOCITY_TYPE
} from '@/utils/constants';
import { leadZero } from '@/utils/helpers';
import {
  validateRadialMotion,
  isValidGalacticLongitude,
  validateRightAscension,
  validateGalacticLatitude,
  validateDeclination,
  VALUE_ERROR,
  ValueError
} from '@/utils/validation/validation';
import type Target from '@/utils/types/target';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getTargetSchema } from './targets';

// A target the user is still entering, before it becomes part of the proposal. It is held in a
// small form local to the entry, not the global proposal form, so it is not saved and goes when
// the entry closes, as before.

const isSameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// The sky direction validators return the error for a wrong value, or null when it is fine
type CoordinateCheck = (value: string) => ValueError | null;

// The error shown for a coordinate, such as "Input formatted incorrectly"
function coordinateErrorText(axis: SkyDirectionAxis, error: ValueError): string {
  return phtTranslations.skyDirection.error[axis][error];
}

// The Galactic longitude validator answers yes or no, so a no becomes a format error
function checkGalacticLongitude(value: string): ValueError | null {
  return isValidGalacticLongitude(value) ? null : VALUE_ERROR.FORMAT;
}

/**
 * A coordinate field, typed as text, that `check` validates. A failed check becomes an error on
 * the field, with the text for the axis and the error code as its message.
 */
function coordinateField(axis: SkyDirectionAxis, check: CoordinateCheck) {
  return z
    .string()
    .superRefine(function reportCoordinateError(value, ctx) {
      const errorCode = check(value);
      if (errorCode !== null) {
        ctx.addIssue({ code: 'custom', message: coordinateErrorText(axis, errorCode) });
      }
    })
    .default('');
}

/** The target's name: required, and not one already in the proposal. */
function nameField(takenNames: string[]) {
  return z
    .string()
    .superRefine(function checkName(name, ctx) {
      if (!name.trim()) {
        ctx.addIssue({ code: 'custom', message: phtTranslations.addTarget.valueError });
      } else if (takenNames.some((taken) => isSameName(taken, name))) {
        ctx.addIssue({ code: 'custom', message: phtTranslations.addTarget.error });
      }
    })
    .default('');
}

// The entry holds the coordinates of every coordinate system under the target's own names, so it
// keeps one shape; each coordinate system checks only its own pair. Galactic coordinates are typed
// as text and become numbers when the target is added.
const unchecked = z.string().default('');
const ICRS_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_ICRS.value),
  raStr: coordinateField(SKY_DIRECTION_AXIS.LONGITUDE, validateRightAscension),
  decStr: coordinateField(SKY_DIRECTION_AXIS.LATITUDE, validateDeclination),
  l: unchecked,
  b: unchecked
};
const GALACTIC_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_GALACTIC.value),
  raStr: unchecked,
  decStr: unchecked,
  l: coordinateField(SKY_DIRECTION_AXIS.LONGITUDE, checkGalacticLongitude),
  b: coordinateField(SKY_DIRECTION_AXIS.LATITUDE, validateGalacticLatitude)
};
// A solar system object is found by name, so it has no coordinates to check
const SSO_COORDINATES = {
  kind: z.literal(REFERENCE_COORDINATE_TYPE_SSO.value),
  raStr: unchecked,
  decStr: unchecked,
  l: unchecked,
  b: unchecked
};

/**
 * The fields shared with a saved target come from its schema, required while entering and with
 * the defaults of a new entry; the coordinates are checked by coordinate system. Error messages
 * are the text to show, as the controlled inputs display them directly. `takenNames` are the names
 * of the targets already in the proposal, so a new target can't repeat one.
 */
export function getTargetEntrySchema(takenNames: string[] = []) {
  const target = getTargetSchema().shape;
  const common = z.object({
    name: nameField(takenNames),
    velType: target.velType.unwrap().default(VELOCITY_TYPE.VELOCITY),
    vel: target.vel.unwrap().default(''),
    velUnit: target.velUnit.unwrap().default(VELOCITY_UNIT.KM_PER_S),
    redshift: target.redshift.unwrap().default(''),
    // Shown in the entry only; not yet saved with the target
    fieldPattern: z.string().default(FIELD_PATTERN_POINTING_CENTRES)
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

      // Velocity or redshift, whichever is in use; a solar system object has neither
      const radialMotion = entry.velType === VELOCITY_TYPE.VELOCITY ? 'vel' : 'redshift';
      if (
        entry.kind !== REFERENCE_COORDINATE_TYPE_SSO.value &&
        entry[radialMotion] &&
        validateRadialMotion(entry[radialMotion])
      ) {
        fail(radialMotion, phtTranslations.velocity.error);
      }
    });
}

// Every field has a value in the form, so the entry is the schema's output, defaults filled in
export type TargetEntryType = z.output<ReturnType<typeof getTargetEntrySchema>>;

/**
 * A new entry for a coordinate system, with the schema's defaults. `kept` carries values over
 * from the entry it replaces, such as the velocity type when the coordinate system changes.
 */
export const getTargetEntryDefaults = (
  kind: number = REFERENCE_COORDINATE_TYPE_ICRS.value,
  kept: Partial<TargetEntryType> = {}
): TargetEntryType => getTargetEntrySchema().parse({ ...kept, kind });

export const TARGET_ENTRY_DEFAULTS = getTargetEntryDefaults();

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
    // The form always holds every field, so its values are the schema's output; the resolver is
    // typed for the input, where the defaulted fields are optional
    resolver: (values, context, options) =>
      zodResolver(getTargetEntrySchema(context?.takenNames))(values, context, options as never)
  });

/** An entry holding an existing target's values, for the edit dialog. */
export const targetEntryFromTarget = (target: Target): TargetEntryType => {
  const galactic = (value?: number) => (value != null ? String(value) : '');
  return {
    ...TARGET_ENTRY_DEFAULTS,
    kind: target.kind ?? REFERENCE_COORDINATE_TYPE_ICRS.value,
    name: target.name ?? '',
    raStr: target.raStr ?? '',
    decStr: target.decStr ?? '',
    l: galactic(target.l),
    b: galactic(target.b),
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
  const edited: Target = { ...target };
  if (changed('name')) edited.name = after.name;
  if (changed('kind')) edited.kind = after.kind;
  if (changed('raStr')) edited.raStr = leadZero(after.raStr).toString();
  if (changed('decStr')) edited.decStr = leadZero(after.decStr).toString();
  if (changed('l')) edited.l = parseFloat(after.l);
  if (changed('b')) edited.b = parseFloat(after.b);
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
