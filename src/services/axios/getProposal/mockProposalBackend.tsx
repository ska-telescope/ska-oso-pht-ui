import { ProposalBackend } from '../../../utils/types/proposal';

const MockProposalBackend: ProposalBackend = {
  prsl_id: 'prsl-t0001-20240815-00006',
  status: 'draft',
  submitted_on: '',
  submitted_by: '',
  investigator_refs: ['prp-ska01-202204-01', '1'],
  metadata: {
    version: 1,
    last_modified_by: 'DefaultUser',
    last_modified_on: 'Thu Aug 15 2024',
    created_by: 'DefaultUser',
    created_on: 'Thu Aug 14 2024'
  },
  cycle: 'SKA_5000_2023',
  info: {
    title: 'My Proposal',
    proposal_type: {
      main_type: 'standard_proposal',
      sub_type: ['joint_proposal']
    },
    abstract: 'This is an abstract',
    science_category: 'Pulsars',
    targets: [
      {
        target_id: 'm2',
        reference_coordinate: {
          kind: 'equatorial',
          ra: '21:33:27.020',
          dec: '-00:49:23.700',
          unit: ['hourangle', 'deg'],
          reference_frame: 'icrs'
        },
        radial_velocity: {
          quantity: {
            value: -3.6,
            unit: 'km/s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        },
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            {
              kind: 'SinglePointParameters',
              offset_x_arcsec: 0.5,
              offset_y_arcsec: 0.5
            }
          ]
        }
      }
    ],
    documents: [],
    investigators: [
      {
        investigator_id: 'prp-ska01-202204-01',
        given_name: 'DefaultUser',
        family_name: 'DefaultUser',
        email: 'ask.lop@map.com',
        organization: 'University of Free Town',
        for_phd: false,
        principal_investigator: true
      },
      {
        investigator_id: '1',
        given_name: 'Jack',
        family_name: 'Green',
        email: 'jgreen@gmail.com',
        for_phd: true,
        principal_investigator: false
      }
    ],
    observation_sets: [
      {
        observation_set_id: 'obs-jtvA2l',
        elevation: 23,
        observing_band: 'low_band',
        array_details: {
          array: 'ska_low',
          subarray: 'aa4',
          number_of_stations: 512,
          spectral_averaging: '1'
        },
        observation_type_details: {
          observation_type: 'continuum',
          bandwidth: {
            value: 75,
            unit: 'MHz'
          },
          central_frequency: {
            value: 200,
            unit: 'MHz'
          },
          supplied: {
            type: 'integration_time',
            quantity: {
              value: 600,
              unit: 'm/s'
            }
          },
          spectral_resolution: '5.43 kHz (8.1 km/s)',
          effective_resolution: '5.43 kHz (8.1 km/s)',
          image_weighting: '1'
        }
      }
    ],
    data_product_sdps: [
      {
        data_products_sdp_id: 'SDP-1',
        options: ['Y', 'N', 'Y', 'N'],
        observation_set_refs: ['obs-jtvA2l'],
        image_size: '10 degrees',
        pixel_size: '1.667 arcsec2',
        weighting: '1'
      }
    ],
    data_product_src_nets: [],
    results: [
      {
        observation_set_ref: 'obs-jtvA2l',
        target_ref: '1',
        result_details: {
          supplied_type: 'sensitivity',
          weighted_continuum_sensitivity: {
            value: 194.8435007170185,
            unit: 'nJy/beam'
          },
          total_continuum_sensitivity: {
            value: 194.85,
            unit: 'uJy/beam'
          },
          weighted_spectral_sensitivity: {
            value: 20811.9719009646,
            unit: 'nJy/beam'
          },
          total_spectral_sensitivity: {
            value: 20.81,
            unit: 'mJy/beam'
          },
          surface_brightness_sensitivity: {
            continuum: 200635049.3145923,
            spectral: 21430276454.186775,
            unit: 'k'
          }
        },
        continuum_confusion_noise: {
          value: 0,
          unit: 'uJy/beam'
        },
        synthesized_beam_size: {
          value: 590,
          unit: 'arcsec2'
        },
        spectral_confusion_noise: {
          value: 0,
          unit: 'uJy/beam'
        }
      }
    ]
  }
};
export default MockProposalBackend;
