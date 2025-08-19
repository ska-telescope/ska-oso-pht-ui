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

export const MockUserBackendList: InvestigatorBackend[] = [
  {
    user_id: 'ee5d98ec-2100-429a-be9e-bef3a8e355df',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Sattar',
    family_name: 'Sarah',
    email: 'Sarah.Sattar@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    for_phd: false,
    principal_investigator: false
  },
  {
    user_id: '733d6b8e-63f1-43e5-b378-abeb2375f28f',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Swain',
    family_name: 'Trevor',
    email: 'Trevor.Swain@community.skao.int',
    officeLocation: null,
    jobTitle: 'Dev Team',
    for_phd: false,
    principal_investigator: false
  },
  {
    user_id: 'fd7719af-ee36-4e6b-90a0-ba2137995534',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Jack',
    family_name: 'Tam',
    email: 'Jack.Tam@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    for_phd: false,
    principal_investigator: false
  },
  {
    user_id: 'a3e51298-97cd-4304-ab80-760ba440b93f',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Chloe',
    family_name: 'Gallacher',
    email: 'Chloe.Gallacher@community.skao.int',
    officeLocation: null,
    jobTitle: 'Dev Team',
    for_phd: false,
    principal_investigator: false
  },
  {
    user_id: '460d6ddc-7722-4c68-90a3-073055cf2d5a',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Tonye',
    family_name: 'Irabor',
    email: 'Tonye.Irabor@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    for_phd: false,
    principal_investigator: false
  },
  {
    user_id: 'e45e8733-5cf4-47eb-9e94-a1109367ba16',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    given_name: 'Meenu',
    family_name: 'Mohan',
    email: 'Meenu.Mohan@assoc.skao.int',
    officeLocation: null,
    jobTitle: 'Release Train Engineer',
    for_phd: false,
    principal_investigator: false
  }
];
