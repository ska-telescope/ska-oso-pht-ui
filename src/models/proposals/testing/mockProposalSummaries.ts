import { PROPOSAL_STATUS, PROPOSAL_TYPE, TYPE_CONTINUUM } from '@/utils/constants';
import type { ProposalSummary } from '../proposalSummary';

const investigators = [
  {
    id: 'prp-ska01-202204-01',
    firstName: 'Tony',
    lastName: 'Bennet',
    email: 'somewhere.vague@example.com',
    phdThesis: false,
    status: 'unknown',
    pi: true
  }
];

/** The summaries of MockProposalBackendList, in the same order. */
const MockProposalSummaries: ProposalSummary[] = [
  {
    id: 'prp-ska01-202204-02',
    status: PROPOSAL_STATUS.DRAFT,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    proposalType: PROPOSAL_TYPE.STANDARD,
    // The fixture's category isn't one the app knows
    scienceCategory: '',
    observingType: TYPE_CONTINUUM,
    title: 'In a galaxy far, far away',
    cycle: 'SKA_2026_1',
    investigators
  },
  {
    id: 'prp-ska01-202204-01',
    status: PROPOSAL_STATUS.SUBMITTED,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
    scienceCategory: '',
    observingType: TYPE_CONTINUUM,
    title: 'The Milky Way View',
    cycle: 'SKAO_2027_1',
    investigators
  },
  {
    id: 'prsl-t0001-20250814-00002',
    status: PROPOSAL_STATUS.SUBMITTED,
    lastUpdated: '2022-09-23T15:43:53.971548Z',
    proposalType: PROPOSAL_TYPE.STANDARD,
    scienceCategory: '4',
    observingType: TYPE_CONTINUUM,
    title: 'Incomplete Proposal',
    cycle: 'SKA_2026_1',
    investigators
  }
];

export default MockProposalSummaries;
