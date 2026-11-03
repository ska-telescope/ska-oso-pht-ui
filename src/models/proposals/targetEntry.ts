import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FIELD_PATTERN_POINTING_CENTRES,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_SSO,
  VELOCITY_TYPE
} from '@/utils/constants';
import { leadZero } from '@/utils/helpers';
import {
  validateRadialMotion,
  validateSkyDirection1Number,
  validateSkyDirection1Text,
  validateSkyDirection2Number,
  validateSkyDirection2Text
} from '@/utils/validation/validation';
import type Target from '@/utils/types/target';
import { getTargetSchema } from './targets';

// A target the user is still entering, before it becomes part of the proposal. It is held in a
// small form local to the entry, not the global proposal form, so it is not saved and goes when
// the entry closes, as before.

const isSameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// Checks a coordinate as text for ICRS or as a number for Galactic; returns its error key, if any
const coordinateError = (axis: 1 | 2, kind: number, value: string): string | null => {
  const isICRS = kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
  let code: string | null;
  if (axis === 1) {
    code = isICRS
      ? validateSkyDirection1Text(value)
      : validateSkyDirection1Number(value)
        ? null
        : '0';
  } else {
    code = isICRS ? validateSkyDirection2Text(value) : validateSkyDirection2Number(value);
  }
  return code === null ? null : `skyDirection.error.${axis}.${code}`;
};

/**
 * The fields shared with a saved target come from its schema, all required while entering.
 * Error messages are translation keys. `takenNames` are the names of the targets already in the
 * proposal, so a new target can't repeat one.
 */
export function getTargetEntrySchema(takenNames: string[] = []) {
  return getTargetSchema()
    .pick({ name: true, kind: true, velType: true, vel: true, velUnit: true, redshift: true })
    .required()
    .extend({
      // Typed as text for either coordinate system; becomes raStr/decStr or l/b when added
      coord1: z.string(),
      coord2: z.string(),
      // Shown in the entry only; not yet saved with the target
      fieldPattern: z.string()
    })
    .superRefine((entry, ctx) => {
      const fail = (path: keyof TargetEntryType, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });

      if (!entry.name.trim()) {
        fail('name', 'addTarget.valueError');
      } else if (takenNames.some((taken) => isSameName(taken, entry.name))) {
        fail('name', 'addTarget.error');
      }

      if (entry.kind === REFERENCE_COORDINATE_TYPE_SSO.value) {
        return;
      }
      // Coordinates are only checked once something has been entered
      if (entry.name !== '' || entry.coord1 !== '' || entry.coord2 !== '') {
        const error1 = coordinateError(1, entry.kind, entry.coord1);
        const error2 = coordinateError(2, entry.kind, entry.coord2);
        if (error1) fail('coord1', error1);
        if (error2) fail('coord2', error2);
      }

      const radialMotion = entry.velType === VELOCITY_TYPE.VELOCITY ? 'vel' : 'redshift';
      if (entry[radialMotion] && validateRadialMotion(entry[radialMotion])) {
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
