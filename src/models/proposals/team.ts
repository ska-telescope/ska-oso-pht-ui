import { z } from 'zod';
import { TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import Investigator, { InvestigatorBackend, InvestigatorMSGraph } from '@/utils/types/investigator';

const investigatorSchema = z.object({
  id: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
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
}): { investigators: InvestigatorFormValues[] } => ({
  investigators: (proposal?.investigators ?? []).map((investigator) =>
    investigatorSchema.parse(investigator)
  )
});

/** Maps the PDM's investigators to the app's, defaulting the flags the PDM may leave out. */
export const investigatorsFromPdm = (
  investigators: InvestigatorBackend[] | null | undefined
): Investigator[] =>
  (investigators ?? []).map((investigator) => ({
    id: investigator.user_id as string,
    status: investigator.status,
    firstName: investigator.given_name ?? undefined,
    lastName: investigator.family_name ?? undefined,
    email: investigator.email ?? undefined,
    phdThesis: investigator.for_phd ?? false,
    pi: investigator.principal_investigator ?? false
  }));

/** A user found in the directory (MS Graph), as an investigator newly invited to a proposal. */
export const investigatorFromUser = (user: InvestigatorMSGraph): Investigator => ({
  id: user.id,
  email: user.email,
  firstName: user.givenName,
  lastName: user.surname,
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  pi: false
});

export const teamFromPdm = (
  investigators?: InvestigatorBackend[] | null
): { investigators: InvestigatorFormValues[] } =>
  getTeamValues({ investigators: investigatorsFromPdm(investigators) });

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
export type TeamType = z.input<ReturnType<typeof getTeamSchema>>;
