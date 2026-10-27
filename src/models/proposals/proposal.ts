import { z } from 'zod';
import { getTitleSchema } from './title';
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
      .refine((value) => value != null, { message: phtTranslations.proposalType.help })
  });
}

export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;
