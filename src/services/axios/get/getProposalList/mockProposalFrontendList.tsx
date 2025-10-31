import { PROPOSAL_STATUS } from '@/utils/constants';
import Proposal from '@/utils/types/proposal';

const MockProposalFrontendList: Proposal[] = [
  {
    id: 'prp-ska01-202204-02',
    status: PROPOSAL_STATUS.DRAFT,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    lastUpdatedBy: 'TestUser',
    createdOn: '2022-09-23T15:43:53.971548Z',
    createdBy: 'TestUser',
    version: 1,
    proposalType: 1,
    proposalSubType: [3],
    scienceCategory: null,
    title: 'In a galaxy far, far away',
    cycle: 'SKA_5000_2023',
    sciencePDF: null,
    technicalPDF: null,
    abstract:
      'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
    investigators: [
      {
        id: 'prp-ska01-202204-01',
        firstName: 'Tony',
        lastName: 'Bennet',
        email: 'somewhere.vague@example.com',
        affiliation: '',
        phdThesis: false,
        status: 'unknown',
        pi: true,
        officeLocation: null,
        jobTitle: null
      }
    ],
    calibrationStrategy: []
  },
  {
    id: 'prp-ska01-202204-01',
    status: PROPOSAL_STATUS.SUBMITTED,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    lastUpdatedBy: 'TestUser',
    createdOn: '2022-09-23T15:43:53.971548Z',
    createdBy: 'TestUser',
    version: 1,
    proposalType: 1,
    proposalSubType: [3],
    scienceCategory: null,
    title: 'The Milky Way View',
    cycle: 'SKA_5000_2023',
    sciencePDF: null,
    technicalPDF: null,
    abstract:
      'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
    investigators: [
      {
        id: 'prp-ska01-202204-01',
        firstName: 'Tony',
        lastName: 'Bennet',
        email: 'somewhere.vague@example.com',
        affiliation: '',
        phdThesis: false,
        status: 'unknown',
        pi: true,
        officeLocation: null,
        jobTitle: null
      }
    ],
    calibrationStrategy: []
  },
  {
    id: 'prsl-t0001-20250814-00002',
    status: PROPOSAL_STATUS.SUBMITTED,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    lastUpdatedBy: 'TestUser',
    createdOn: '2022-09-23T15:43:53.971548Z',
    createdBy: 'TestUser',
    version: 1,
    proposalType: 1,
    proposalSubType: [],
    scienceCategory: 4,
    title: 'Incomplete Proposal',
    cycle: 'SKA_5000_2023',
    sciencePDF: null,
    technicalPDF: null,
    abstract:
      'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering',
    investigators: [
      {
        id: 'prp-ska01-202204-01',
        firstName: 'Tony',
        lastName: 'Bennet',
        email: 'somewhere.vague@example.com',
        affiliation: '',
        phdThesis: false,
        status: 'unknown',
        pi: true,
        officeLocation: null,
        jobTitle: null
      }
    ],
    calibrationStrategy: []
  }
];

export default MockProposalFrontendList;
