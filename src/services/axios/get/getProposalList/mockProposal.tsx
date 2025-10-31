import { ProposalBackend } from '@utils/types/proposal.tsx';
import { PROPOSAL_STATUS } from '@/utils/constants';

const MockProposal: ProposalBackend[] = [
  {
    prsl_id: 'prsl-test-20250814-00003',
    status: PROPOSAL_STATUS.DRAFT,
    submitted_by: '',
    metadata: {
      version: 2,
      created_by: 'Cypress Default User',
      created_on: '2025-08-15T14:11:33.237283Z',
      last_modified_by: 'a3e51298-97cd-4304-ab80-760ba440b93f',
      last_modified_on: '2025-08-15T14:11:33.248432Z',
      pdm_version: '19.1.0'
    },
    investigator_refs: [],
    cycle: 'SKAO_2027_1',
    proposal_info: {
      title: 'Proposal Title',
      proposal_type: {
        main_type: 'standard_proposal',
        attributes: []
      },
      abstract: '',
      investigators: []
    },
    observation_info: {
      targets: [
        {
          target_id: 'M28',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: 30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: -12.345,
              unit: 'm/s'
            },
            definition: 'OPTICAL',
            reference_frame: 'LSRK',
            redshift: 1.2
          }
        },
        {
          target_id: 'M1',
          pointing_pattern: {
            active: 'SinglePointParameters',
            parameters: [
              {
                kind: 'SinglePointParameters',
                offset_x_arcsec: 0.0,
                offset_y_arcsec: 0.0
              }
            ]
          },
          reference_coordinate: {
            kind: 'equatorial',
            ra: 250.0,
            dec: -30.0,
            unit: ['deg', 'deg'],
            reference_frame: 'icrs'
          },
          radial_velocity: {
            quantity: {
              value: 0.0,
              unit: 'km/s'
            },
            definition: 'RADIO',
            reference_frame: 'LSRK',
            redshift: 0.0
          }
        }
      ],
      documents: [],
      observation_sets: [],
      data_product_sdps: [],
      data_product_src_nets: [],
      result_details: []
    }
  }
];

export default MockProposal;
