import { z } from 'zod';
import Investigator, { InvestigatorBackend } from '@/utils/types/investigator';
import { getInvestigators } from '@services/axios/get/getProposal/getProposal';

const investigatorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
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
  investigators?: Investigator[] | null;
}): { investigators: InvestigatorFormValues[] } => ({
  investigators: (proposal?.investigators ?? []).map((investigator) =>
    investigatorSchema.parse(investigator)
  )
});

export const teamFromPdm = (
  investigators?: InvestigatorBackend[] | null
): { investigators: InvestigatorFormValues[] } =>
  getTeamValues({ investigators: getInvestigators(investigators) });

export const teamToPdm = (investigators: InvestigatorFormValues[]): InvestigatorBackend[] =>
  getTeamSchema()
    .parse({ investigators })
    .investigators.map((investigator) => ({
      user_id: investigator.id,
      status: investigator.status,
      given_name: investigator.firstName,
      family_name: investigator.lastName,
      email: investigator.email,
      for_phd: investigator.phdThesis,
      principal_investigator: investigator.pi
    }));

export type InvestigatorFormValues = z.input<typeof investigatorSchema>;
export type TeamType = z.input<ReturnType<typeof getTeamSchema>>;
