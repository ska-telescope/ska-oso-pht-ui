import { PROPOSAL_STATUS, PROPOSAL_TYPE } from '@/utils/constants';
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
    proposalType: 'standard_proposal',
    proposalSubType: ['coordinated_proposal'],
    scienceCategory: '',
    title: 'In a galaxy far, far away',
    cycle: 'SKA_2026_1',
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
    proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
    proposalSubType: [],
    scienceCategory: '',
    title: 'The Milky Way View',
    cycle: 'SKAO_2027_1',
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
    proposalType: 'standard_proposal',
    proposalSubType: [],
    scienceCategory: '4',
    title: 'Incomplete Proposal',
    cycle: 'SKA_2026_1',
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
