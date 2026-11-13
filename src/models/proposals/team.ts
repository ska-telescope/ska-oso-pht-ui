import { z } from 'zod';
import { InvestigatorBackend } from '@/utils/types/investigator';
import { getInvestigators } from '@services/axios/get/getProposal/getProposal';

const investigatorSchema = z.object({
  id: z.string(),
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phdThesis: z.boolean(),
  status: z.string(),
  pi: z.boolean()
});

export function getTeamSchema() {
  return z.object({
    investigators: z.array(investigatorSchema).default([])
  });
}

export const getTeamValues = (proposal?: {
  investigators?: InvestigatorFormValues[] | null;
}): { investigators: InvestigatorFormOutput[] } => ({
  investigators: (proposal?.investigators ?? []).map((investigator) =>
    investigatorSchema.parse(investigator)
  )
});

export const teamFromPdm = (
  investigators?: InvestigatorBackend[] | null
): { investigators: InvestigatorFormOutput[] } =>
  getTeamValues({ investigators: getInvestigators(investigators) });

export const investigatorToPdm = (investigator: InvestigatorFormValues): InvestigatorBackend => ({
  user_id: investigator.id,
  status: investigator.status,
  ...(investigator.firstName?.trim() && { given_name: investigator.firstName }),
  ...(investigator.lastName?.trim() && { family_name: investigator.lastName }),
  ...(investigator.email?.trim() && { email: investigator.email }),
  for_phd: investigator.phdThesis,
  principal_investigator: investigator.pi
});

export const teamToPdm = (investigators: InvestigatorFormValues[]): InvestigatorBackend[] =>
  getTeamSchema().parse({ investigators }).investigators.map(investigatorToPdm);

export type InvestigatorFormValues = z.input<typeof investigatorSchema>;
type InvestigatorFormOutput = z.output<typeof investigatorSchema>;
export type TeamType = z.input<ReturnType<typeof getTeamSchema>>;
