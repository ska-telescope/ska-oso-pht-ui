export type InvestigatorBackend = {
  investigator_id: number;
  given_name: string;
  family_name: string;
  email?: string;
  organization: string;
  for_phd: boolean;
  principal_investigator: boolean;
};

type Investigator = {
  id: number;
  given_name: string;
  family_name: string;
  email: string;
  affiliation: string;
  phdThesis: boolean;
  status: string;
  pi: boolean;
};

export default Investigator;
