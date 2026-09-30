import { z } from 'zod';
import { getDetailsSchema } from '@/models/proposal/details.ts';

export function getProposalSchema() {
  return z.object({
    details: getDetailsSchema()
  });
}

// TODO remove 'Type' here? Better to distinguish the backend model by PDM prefix or sometihing
export type ProposalType = z.input<ReturnType<typeof getProposalSchema>>;
