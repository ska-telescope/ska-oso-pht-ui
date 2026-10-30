import { z } from 'zod';
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
    // Optional until they are mapped from the PDM and seeded in useProposalForm.
    targets: getTargetsSchema().optional(),
    targetObservation: getTargetObservationSchema().optional(),
    calibrationStrategy: getCalibrationStrategySchema().optional()
  });
}

export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;
