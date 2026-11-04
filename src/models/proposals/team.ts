import { z } from 'zod';
import Investigator, { InvestigatorBackend } from '@/utils/types/investigator';

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

export const teamFromProposal = (proposal?: {
  investigators?: Investigator[] | null;
}): { investigators: InvestigatorFormValues[] } => getTeamValues(proposal);

export const mergeTeamInvestigators = (
  investigators: InvestigatorFormValues[],
  existing: Investigator[] = []
): Investigator[] =>
  investigators.map((investigator) => ({
    affiliation: '',
    officeLocation: null,
    jobTitle: null,
    ...existing.find(({ id }) => id === investigator.id),
    ...investigatorSchema.parse(investigator)
  }));

export const teamToPdm = (
  investigators: InvestigatorFormValues[],
  existing: InvestigatorBackend[] = []
): InvestigatorBackend[] =>
  getTeamSchema()
    .parse({ investigators })
    .investigators.map((investigator) => ({
      organization: '',
      officeLocation: null,
      jobTitle: null,
      ...existing.find(({ user_id }) => user_id === investigator.id),
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
