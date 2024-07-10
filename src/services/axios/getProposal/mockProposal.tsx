import { ProposalBackend } from '../../../utils/types/proposal';

const MockProposal: ProposalBackend = {
  prsl_id: '1',
  status: 'draft',
  submitted_by: '',
  submitted_on: '',
  cycle: 'SKA_5000_2023',
  investigator_refs: [],
  info: {
    title: 'The Milky Way View Backend Format',
    abstract: 'This is the Abstract',
    proposal_type: { main_type: 'Standard Proposal', sub_type: ['Coordinated Proposal'] },
    science_category: 'Science Category',
    targets: [
      {
        target_id: 'M1',
        pointing_pattern: {
          active: '',
          parameters: [
            {
              kind: '',
              offset_x_arcsec: 0,
              offset_y_arcsec: 0
            }
          ]
        },
        reference_coordinate: {
          kind: '',
          ra: 12345,
          dec: 12345,
          unit: [],
          reference_frame: ''
        },
        radial_velocity: {
          quantity: {
            value: 123,
            unit: ''
          },
          definition: '',
          reference_frame: '',
          redshift: 0
        }
      },
      {
        target_id: 'M2',
        pointing_pattern: {
          active: '',
          parameters: [
            {
              kind: '',
              offset_x_arcsec: 0,
              offset_y_arcsec: 0
            }
          ]
        },
        reference_coordinate: {
          kind: '',
          ra: 12345,
          dec: 12345,
          unit: [],
          reference_frame: ''
        },
        radial_velocity: {
          quantity: {
            value: 123,
            unit: ''
          },
          definition: '',
          reference_frame: '',
          redshift: 0
        }
      }
    ],
    investigators: [
      {
        investigator_id: 1,
        given_name: 'Van Loo',
        family_name: 'Cheng',
        email: 'ask.lop@map.com',
        organization: 'University of Free',
        for_phd: true,
        principal_investigator: true
      },
      {
        investigator_id: 2,
        given_name: 'Van Loo',
        family_name: 'Cheng',
        email: 'ask.someoneElse@map.com',
        organization: 'University of Free',
        for_phd: false,
        principal_investigator: false
      }
    ],
    documents: [],
    observation_sets: [],
    data_product_sdps: [],
    data_product_src_nets: [],
    results: []
  }
};

export default MockProposal;
