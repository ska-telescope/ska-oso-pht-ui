type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // This should always be a SKAO email (@community.skao.int or @skao.int)
  affiliation: string; // TODO should we remove affiliation and just use officeLocation?
  phdThesis: boolean;
  status: string;
  pi: boolean;
  officeLocation: string | null;
  jobTitle: string | null;
};

export default TeamMember;

export type UserBackend = {
  id: string;
  givenName: string;
  surname: string;
  userPrincipalName: string; // This is the SKAO email address in the backend
  displayName: string;
  officeLocation: string | null;
  jobTitle: string | null;
};

export type InvestigatorBackend = {
  investigator_id: string;
  status: string;
  given_name: string;
  family_name: string;
  email: string;
  organization?: string;
  for_phd?: boolean;
  principal_investigator?: boolean;
};
