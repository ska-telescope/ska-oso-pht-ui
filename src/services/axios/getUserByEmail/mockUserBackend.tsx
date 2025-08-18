import { TEAM_STATUS_TYPE_OPTIONS } from '@/utils/constants';
import { InvestigatorBackend } from '@/utils/types/investigator';

export const MockUserBackendPartial: InvestigatorBackend = {
  user_id: 'entra-123',
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  given_name: 'Paulo',
  family_name: 'Santos',
  email: 'paulo.santos@community.skao.int',
  officeLocation: null,
  jobTitle: null,
  for_phd: false
};

export const MockUserBackendComplete: InvestigatorBackend = {
  user_id: 'entra-234',
  status: TEAM_STATUS_TYPE_OPTIONS.pending,
  given_name: 'Saba',
  family_name: 'Ali',
  email: 'saba.ali@skao.int',
  officeLocation: 'SKAO HQ',
  jobTitle: 'software engineer',
  for_phd: false,
  principal_investigator: false
};
