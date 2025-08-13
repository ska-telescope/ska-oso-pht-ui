import { UserBackend } from '@/utils/types/teamMember';

export const MockUserBackendPartial: UserBackend = {
  id: 'entra-123',
  givenName: 'Paulo',
  surname: 'Santos',
  userPrincipalName: 'paulo.santos@community.skao.int',
  displayName: 'Paulo Santos',
  officeLocation: null,
  jobTitle: null
};

export const MockUserBackendComplete: UserBackend = {
  id: 'entra-234',
  givenName: 'Saba',
  surname: 'Ali',
  userPrincipalName: 'saba.ali@skao.int',
  displayName: 'Saba Ali',
  officeLocation: 'SKAO HQ',
  jobTitle: 'software engineer'
};
