import { z } from 'zod';
import type { UseFormReturn } from 'react-hook-form';
import { getTitleSchema } from './title';
import { getTargetsSchema } from './targets';
import { getTargetObservationSchema } from './targetObservation';
import { getCalibrationStrategySchema } from './calibrationStrategy';
import { PROPOSAL_TYPE } from '@/utils/constants';
import phtTranslations from '../../../public/locales/en/pht.json';

export function getProposalTypeSchema() {
  return z.enum(PROPOSAL_TYPE);
}

export function getProposalSchema() {
  return z.object({
    title: getTitleSchema(),
    proposalType: getProposalTypeSchema()
      .nullish()
      .refine((value) => value != null, { message: phtTranslations.proposalType.help }),
    // These slices check structure only. Proposals loaded through the legacy mapper can contain
    // invalid or missing data. The validation of that data against the rules for content is done
    // in the submit validation.
    targets: getTargetsSchema(),
    targetObservation: getTargetObservationSchema(),
    calibrationStrategy: getCalibrationStrategySchema()
  });
}

export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;

/** What helpers outside React need from the global form to read and write its slices. */
export type ProposalFormAccess = Pick<UseFormReturn<ProposalType>, 'getValues' | 'setValue'>;

/** The slices the form owns that the legacy store still holds a copy of for its readers. */
export const STORE_COPIED_SLICES = ['targets', 'targetObservation', 'calibrationStrategy'] as const;
