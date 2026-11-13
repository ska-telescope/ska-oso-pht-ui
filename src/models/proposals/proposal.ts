import { z } from 'zod';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getTitleSchema } from './title';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';
import { getDocumentRefSchema } from './documents';
import { PROPOSAL_TYPE } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getDetailsSchema } from './details';
import { getTeamSchema } from './team';

export function getProposalTypeSchema() {
  return z.enum(PROPOSAL_TYPE);
}

// Each slice has the default of a new proposal, so the form's defaults are the schema's parse of
// an empty object. A default is not checked (Zod 4 returns it as it is), which is why it wraps the
// slice's checks: a new proposal has no title or type yet.
export function getProposalSchema() {
  return z.object({
    title: getTitleSchema().default(''),
    proposalType: getProposalTypeSchema()
      .nullish()
      // Returns a plain boolean so the type is not narrowed to non-null, which the default needs
      .refine((value): boolean => value != null, { message: phtTranslations.proposalType.help })
      // Controlled fields need null to clear a previous selection on reset
      .default(null),
    abstract: getDetailsSchema().shape.abstract.default(''),
    scienceCategory: getDetailsSchema().shape.scienceCategory.default(null),
    ...getTeamSchema().shape,
    // These slices check structure only. Proposals loaded through the legacy mapper can contain
    // invalid or missing data. The validation of that data against the rules for content is done
    // in the submit validation.
    targets: getTargetsSchema().default(() => []),
    targetObservation: getTargetObservationSchema().default(() => []),
    calibrationStrategy: getCalibrationStrategySchema().default(() => []),
    sciencePDF: getDocumentRefSchema().default(null),
    technicalPDF: getDocumentRefSchema().default(null)
  });
}

// The form always holds every slice, so its values are the schema's output, defaults filled in
export type ProposalType = z.output<ReturnType<typeof getProposalSchema>>;

/**
 * The form's resolver. The schema is typed for its input, where the defaulted slices are
 * optional, so it is cast to the form's values once here.
 */
export const getProposalResolver = (): Resolver<ProposalType> =>
  zodResolver(getProposalSchema()) as unknown as Resolver<ProposalType>;

/** What helpers outside React need from the global form to read and write its slices. */
export type ProposalFormAccess = Pick<UseFormReturn<ProposalType>, 'getValues' | 'setValue'>;

/**
 * The slices the form owns, which the legacy store still holds a copy of for its readers. Taken
 * from the schema, so a newly migrated slice is copied too.
 */
export const STORE_COPIED_SLICES = Object.keys(getProposalSchema().shape) as (keyof ProposalType)[];
