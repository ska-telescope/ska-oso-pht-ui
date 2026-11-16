import { z } from 'zod';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getTitleSchema } from './title';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';
import { getDocumentRefSchema } from './documents';
import { getDataProductsSchema } from './dataProducts';
import { PROPOSAL_TYPE } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getDetailsSchema } from './details';
import { getTeamSchema } from './team';

export function getProposalTypeSchema() {
  return z.enum(PROPOSAL_TYPE);
}

export function getProposalSchema() {
  return z.object({
    title: getTitleSchema(),
    proposalType: getProposalTypeSchema()
      // Controlled fields need null to clear a previous selection on reset
      .nullable()
      // Returns a plain boolean so the type is not narrowed to non-null
      .refine((value): boolean => value != null, { message: phtTranslations.proposalType.help }),
    abstract: getDetailsSchema().shape.abstract,
    scienceCategory: getDetailsSchema().shape.scienceCategory,
    // Without the subgroup's own default: the form's defaults are in getProposalFormDefaults, and
    // the form is typed as the schema's input, where a defaulted field would be optional
    investigators: getTeamSchema().shape.investigators.unwrap(),
    targets: getTargetsSchema(),
    targetObservation: getTargetObservationSchema(),
    calibrationStrategy: getCalibrationStrategySchema(),
    sciencePDF: getDocumentRefSchema(),
    technicalPDF: getDocumentRefSchema(),
    dataProducts: getDataProductsSchema()
  });
}

// The form holds the schema's input, which can be invalid, such as a data product without a unit.
// TODO rename to ProposalFormInput, as in the docs, once the open MRs that use this name merge
export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;

/**
 * The form's resolver. The form is typed as the schema's input, and its handleSubmit output is not
 * used, so the resolver is cast to the input once here.
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
