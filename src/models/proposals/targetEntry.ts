import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateTargetId } from '@/utils/helpers';
import phtTranslations from '@/locales/en/pht.json';
import {
  getTargetSchema,
  newTarget,
  REFERENCE_COORDINATE_KIND,
  ReferenceCoordinateKind,
  TargetInput
} from './targets';

// A target the user is still entering, before it becomes part of the proposal. It is held in a
// small form local to the entry, not the global proposal form, so it is not saved and goes when
// the entry closes.

// The proposal's other targets, whose names a target can't repeat
type OtherTarget = Pick<TargetInput, 'id' | 'name'>;

const isSameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * A target with the proposal's rules, and a name not used by another of the proposal's targets.
 * A solar system object's name is chosen in its coordinates, so a repeated one is shown there too.
 */
export function getTargetEntrySchema(targets: OtherTarget[] = []) {
  return getTargetSchema().superRefine((entry, ctx) => {
    const name = entry.name.trim();
    const repeated = targets.some((other) => other.id !== entry.id && isSameName(other.name, name));
    if (!repeated) {
      return;
    }
    const message = phtTranslations.addTarget.error;
    ctx.addIssue({ code: 'custom', path: ['name'], message });
    if (entry.referenceCoordinate.kind === REFERENCE_COORDINATE_KIND.SPECIAL) {
      ctx.addIssue({ code: 'custom', path: ['referenceCoordinate', 'name'], message });
    }
  });
}

/**
 * A new entry for a coordinate system, with a new ID. `kept` carries values over from the entry
 * it replaces, such as the radial motion when the coordinate system changes.
 */
export const newTargetEntry = (
  kind: ReferenceCoordinateKind = REFERENCE_COORDINATE_KIND.ICRS,
  kept: Partial<TargetInput> = {}
): TargetInput => ({
  ...newTarget(generateTargetId(), kind),
  ...kept
});

interface TargetEntryContext {
  targets?: OtherTarget[];
}

/**
 * The local form for one target entry, validated by its schema. Pass the proposal's targets so a
 * new or edited target can't repeat another's name.
 */
export const useTargetEntryForm = (targets?: OtherTarget[]) =>
  useForm<TargetInput, TargetEntryContext>({
    // Each field is checked as it changes
    mode: 'onChange',
    defaultValues: newTargetEntry(),
    // The targets change as they are added, so they reach the schema through the context
    context: { targets },
    resolver: (values, context, options) =>
      zodResolver(getTargetEntrySchema(context?.targets))(values, context, options as never)
  });
