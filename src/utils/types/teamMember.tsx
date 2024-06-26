export type TeamMemberBackend = {
  investigator_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  country?: string;
  organization: string;
  for_phd: boolean;
  principal_investigator: boolean;
};

type TeamMember = {
  id: number;
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
