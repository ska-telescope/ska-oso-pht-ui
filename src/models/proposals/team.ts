import { z } from 'zod';
import Investigator, { InvestigatorBackend } from '@/utils/types/investigator';

const investigatorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  affiliation: z.string(),
  phdThesis: z.boolean(),
  status: z.string(),
  pi: z.boolean(),
  officeLocation: z.string().nullable(),
  jobTitle: z.string().nullable()
});

export function getTeamSchema() {
  return z.object({
    investigators: z.array(investigatorSchema).default([])
  });
}

export const getTeamValues = (proposal?: {
  investigators?: Investigator[] | null;
}): { investigators: Investigator[] } => ({
  investigators: (proposal?.investigators ?? []).map((investigator) => ({
    ...investigator,
    officeLocation: investigator.officeLocation ?? null,
    jobTitle: investigator.jobTitle ?? null
  }))
});

export const teamFromProposal = (proposal?: {
  investigators?: Investigator[] | null;
}): { investigators: Investigator[] } => getTeamValues(proposal);

export const teamToPdm = (investigators: Investigator[]): InvestigatorBackend[] =>
  getTeamSchema()
    .parse({ investigators })
    .investigators.map((investigator) => ({
      user_id: investigator.id,
      status: investigator.status,
      given_name: investigator.firstName,
      family_name: investigator.lastName,
      email: investigator.email,
      organization: investigator.affiliation,
      for_phd: investigator.phdThesis,
      principal_investigator: investigator.pi,
      officeLocation: investigator.officeLocation,
      jobTitle: investigator.jobTitle
    }));

export type TeamType = z.input<ReturnType<typeof getTeamSchema>>;
