type Investigator = {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // This should always be a SKAO email (@community.skao.int or @skao.int)
  affiliation: string;
  phdThesis: boolean;
  status: string;
  pi: boolean;
  officeLocation: string | null;
  jobTitle: string | null;
};

export default Investigator;

export type InvestigatorBackend = {
  user_id: string;
  status: string;
  given_name: string;
  family_name: string;
  email: string;
  organization?: string;
  for_phd?: boolean;
  principal_investigator?: boolean;
  officeLocation: string | null;
  jobTitle: string | null;
};

export type InvestigatorMSGraph = {
  id: string;
  givenName: string;
  surname: string;
  email: string;
  officeLocation: string | null;
  jobTitle: string | null;
};
