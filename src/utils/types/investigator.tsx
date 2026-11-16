import type { Investigator as InvestigatorPDM } from '@/generated/models/investigator';

type Investigator = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string; // This should always be a SKAO email (@community.skao.int or @skao.int)
  phdThesis: boolean;
  status: string;
  pi: boolean;
};

export default Investigator;

export type InvestigatorBackend = InvestigatorPDM;

export type InvestigatorMSGraph = {
  id: string;
  givenName: string;
  surname: string;
  email: string;
};
