import { TEAM_STATUS_TYPE_OPTIONS } from '@/utils/constants';
import Investigator from '@/utils/types/investigator';

export const MockUserFrontendPartial: Investigator = {
  id: 'entra-123',
  firstName: 'Paulo',
  lastName: 'Santos',
  email: 'paulo.santos@community.skao.int',
  affiliation: '',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  pi: false,
  officeLocation: null,
  jobTitle: null
};

export const MockUserFrontendComplete: Investigator = {
  id: 'entra-234',
  firstName: 'Saba',
  lastName: 'Ali',
  email: 'saba.ali@skao.int',
  affiliation: '',
  phdThesis: false,
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  pi: false,
  officeLocation: 'SKAO HQ',
  jobTitle: 'software engineer'
};
