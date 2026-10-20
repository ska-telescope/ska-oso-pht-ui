import { z } from 'zod';
import { getTitleSchema } from './title';

export function getProposalSchema() {
  return z.object({
    title: getTitleSchema()
  });
}

export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;
