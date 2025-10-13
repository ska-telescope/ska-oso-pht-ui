import { TEAM_STATUS_TYPE_OPTIONS } from '@utils/constants.ts';
import Investigator from '@utils/types/investigator.tsx';

export const MockUserFrontendList: Investigator[] = [
  {
    id: 'ee5d98ec-2100-429a-be9e-bef3a8e355df',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Sarah',
    lastName: 'Sattar',
    email: 'Sarah.Sattar@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    phdThesis: false,
    pi: false,
    affiliation: ''
  },
  {
    id: '733d6b8e-63f1-43e5-b378-abeb2375f28f',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Trevor',
    lastName: 'Swain',
    email: 'Trevor.Swain@community.skao.int',
    officeLocation: null,
    jobTitle: 'Dev Team',
    phdThesis: false,
    pi: false,
    affiliation: ''
  },
  {
    id: 'fd7719af-ee36-4e6b-90a0-ba2137995534',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Jack',
    lastName: 'Tam',
    email: 'Jack.Tam@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    phdThesis: false,
    pi: false,
    affiliation: ''
  },
  {
    id: 'a3e51298-97cd-4304-ab80-760ba440b93f',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Chloe',
    lastName: 'Gallacher',
    email: 'Chloe.Gallacher@community.skao.int',
    officeLocation: null,
    jobTitle: 'Dev Team',
    phdThesis: false,
    pi: false,
    affiliation: ''
  },
  {
    id: '460d6ddc-7722-4c68-90a3-073055cf2d5a',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Tonye',
    lastName: 'Irabor',
    email: 'Tonye.Irabor@community.skao.int',
    officeLocation: null,
    jobTitle: null,
    phdThesis: false,
    pi: false,
    affiliation: ''
  },
  {
    id: 'e45e8733-5cf4-47eb-9e94-a1109367ba16',
    status: TEAM_STATUS_TYPE_OPTIONS.pending,
    firstName: 'Meenu',
    lastName: 'Mohan',
    email: 'Meenu.Mohan@assoc.skao.int',
    officeLocation: null,
    jobTitle: 'Release Train Engineer',
    phdThesis: false,
    pi: false,
    affiliation: ''
  }
];
