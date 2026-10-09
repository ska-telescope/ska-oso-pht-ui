import type { Investigator as InvestigatorPDM } from '@/generated/models/investigator';

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

// officeLocation and jobTitle are not part of the PDM; the UI carries them on the investigator
export type InvestigatorBackend = InvestigatorPDM & {
  officeLocation?: string | null;
  jobTitle?: string | null;
};

export type InvestigatorMSGraph = {
  id: string;
  givenName: string;
  surname: string;
  email: string;
  officeLocation: string | null;
  jobTitle: string | null;
};
