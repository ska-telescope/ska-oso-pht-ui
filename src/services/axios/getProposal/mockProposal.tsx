import { ProposalBackend } from '../../../utils/types/proposal';

const MockProposal: ProposalBackend = {
  prsl_id: '1',
  status: 'draft',
  submitted_by: '',
  submitted_on: '',
  proposal_info: {
    title: 'The Milky Way View Backend Format',
    cycle: 'SKA_5000_2023',
    abstract: 'This is the Abstract',
    proposal_type: { main_type: 'Standard Proposal', sub_type: 'Coordinated Proposal' },
    science_category: 'Science Category',
    targets: [
      {
        name: 'M28',
        right_ascension: '22:33:55',
        declination: '22:33:55',
        velocity: 34.6,
        velocity_unit: 'km/s',
        right_ascension_unit: 'degrees',
        declination_unit: 'dd:mm:ss'
      },
      {
        name: 'M1',
        right_ascension: '22:33:55',
        declination: '22:33:55',
        velocity: 34.6,
        velocity_unit: 'km/s',
        right_ascension_unit: 'hh:mm:ss',
        declination_unit: 'dd:mm:ss'
      }
    ],
    investigators: [
      {
        investigator_id: 1,
        first_name: 'Van Loo',
        last_name: 'Cheng',
        email: 'ask.lop@map.com',
        organization: 'University of Free',
        for_phd: true,
        principal_investigator: true
      },
      {
        investigator_id: 2,
        first_name: 'Van Loo',
        last_name: 'Cheng',
        country: 'Lagoon',
        organization: 'University of Free',
        for_phd: false,
        principal_investigator: false
      }
    ],
    science_programmes: [
      {
        array: 'MID',
        subarray: 'subarray 1',
        linked_sources: ['M1', 'M2'],
        observation_type: 'Continuum'
      },
      {
        array: 'MID',
        subarray: 'subarray 1',
        linked_sources: ['M1', 'M2'],
        observation_type: 'Continuum'
      }
    ]
  }
};

export default MockProposal;
