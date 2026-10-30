import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  FIELD_PATTERN_POINTING_CENTRES,
  REFERENCE_COORDINATE_TYPE_ICRS,
  VELOCITY_TYPE
} from '@/utils/constants';
import { leadZero } from '@/utils/helpers';
import type Target from '@/utils/types/target';

// A target the user is still entering, before it becomes part of the proposal. It is held in a
// small form local to the entry, not the global proposal form, so it is not saved and goes when
// the entry closes, as before.

export function getTargetEntrySchema() {
  return z.object({
    referenceCoordinates: z.number(),
    name: z.string(),
    coord1: z.string(),
    coord2: z.string(),
    velType: z.number(),
    vel: z.string(),
    velUnit: z.number(),
    redshift: z.string(),
    fieldPattern: z.string()
  });
}

export type TargetEntryType = z.input<ReturnType<typeof getTargetEntrySchema>>;

export const TARGET_ENTRY_DEFAULTS: TargetEntryType = {
  referenceCoordinates: REFERENCE_COORDINATE_TYPE_ICRS.value,
  name: '',
  coord1: '',
  coord2: '',
  velType: VELOCITY_TYPE.VELOCITY,
  vel: '',
  velUnit: 0,
  redshift: '',
  fieldPattern: FIELD_PATTERN_POINTING_CENTRES
};

/** The local form for one target entry. */
export const useTargetEntryForm = () =>
  useForm<TargetEntryType>({ defaultValues: { ...TARGET_ENTRY_DEFAULTS } });

/** An entry holding an existing target's values, for the edit dialog. */
export const targetEntryFromTarget = (target: Target): TargetEntryType => {
  const kind = target.kind ?? REFERENCE_COORDINATE_TYPE_ICRS.value;
  const isICRS = kind === REFERENCE_COORDINATE_TYPE_ICRS.value;
  const coordinate = (icrs?: string, galactic?: number) =>
    isICRS ? (icrs ?? '') : galactic != null ? String(galactic) : '';
  return {
    ...TARGET_ENTRY_DEFAULTS,
    referenceCoordinates: kind,
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
  const isICRS = after.referenceCoordinates === REFERENCE_COORDINATE_TYPE_ICRS.value;
  const edited: Target = { ...target };
  if (changed('name')) edited.name = after.name;
  if (changed('referenceCoordinates')) edited.kind = after.referenceCoordinates;
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
