/*
export type TeamMemberBackend = {
  investigator_id: number;
  given_name: string;
  family_name: string;
  email?: string;
  country?: string;
  organization: string;
  for_phd: boolean;
  principal_investigator: boolean;
};
*/

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  affiliation: string;
  phdThesis: boolean;
  status: string;
  pi: boolean;
};

export default TeamMember;
