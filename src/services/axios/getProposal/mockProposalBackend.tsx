import { ProposalBackend } from '../../../utils/types/proposal';

const MockProposalBackend: ProposalBackend = {
  prsl_id: 'prsl-t0001-20250613-00002',
  status: 'draft',
  submitted_by: '',
  metadata: {
    version: 10,
    created_by: 'DefaultUser',
    created_on: '2025-06-13T13:48:34.963103Z',
    last_modified_by: 'DefaultUser',
    last_modified_on: '2025-06-24T16:48:47.127032Z',
    pdm_version: '18.1.0'
  },
  cycle: 'SKA_1962_2024',
  info: {
    title: 'New Proposal test2',
    proposal_type: {
      main_type: 'standard_proposal',
      attributes: ['coordinated_proposal']
    },
    abstract: 'My scienceTest abstract',
    science_category: 'Cosmology',
    targets: [
      {
        target_id: 'target',
        name: '',
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            {
              kind: 'SinglePointParameters',
              offset_x_arcsec: 0.5,
              offset_y_arcsec: 0.5
            }
          ]
        },
        reference_coordinate: {
          kind: 'equatorial',
          ra: '00:00:00.0',
          dec: '00:00:00.0',
          reference_frame: 'icrs',
          epoch: 2000,
          unit: ['hourangle', 'deg']
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km / s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      },
      {
        target_id: 'target2',
        name: '',
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            {
              kind: 'SinglePointParameters',
              offset_x_arcsec: 0.5,
              offset_y_arcsec: 0.5
            }
          ]
        },
        reference_coordinate: {
          kind: 'equatorial',
          ra: '05:34:30.900',
          dec: '+22:00:53.000',
          reference_frame: 'icrs',
          epoch: 2000,
          unit: ['hourangle', 'deg']
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km / s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      },
      {
        target_id: 'M2',
        name: '',
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            {
              kind: 'SinglePointParameters',
              offset_x_arcsec: 0.5,
              offset_y_arcsec: 0.5
            }
          ]
        },
        reference_coordinate: {
          kind: 'equatorial',
          ra: '21:33:27.0200',
          dec: '-00:49:23.700',
          reference_frame: 'icrs',
          epoch: 2000,
          unit: ['hourangle', 'deg']
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km / s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      }
    ],
    observation_sets: [
      {
        observation_set_id: 'obs-obR1Ej',
        observing_band: 'low_band',
        elevation: 20,
        array_details: {
          array: 'ska_low',
          subarray: 'aa4',
          number_of_stations: 512
        },
        observation_type_details: {
          observation_type: 'continuum',
          bandwidth: {
            value: 300,
            unit: 'MHz'
          },
          central_frequency: {
            value: 200,
            unit: 'MHz'
          },
          supplied: {
            supplied_type: 'integration_time',
            quantity: {
              value: 1,
              unit: 'h'
            }
          },
          spectral_resolution: '5.43 kHz (8.1 km/s)',
          effective_resolution: '5.43 kHz (8.1 km/s)',
          image_weighting: 'uniform',
          robust: '0',
          spectral_averaging: '1'
        }
      }
    ],
    data_product_sdps: [
      {
        data_products_sdp_id: 'SDP-2',
        options: ['Y', 'N', 'Y', 'N'],
        observation_set_refs: ['obs-obR1Ej'],
        image_size: {
          value: 15,
          unit: 'deg'
        },
        pixel_size: {
          value: 1.007,
          unit: 'arcsec'
        },
        weighting: '1'
      }
    ],
    result_details: [
      {
        observation_set_ref: 'obs-obR1Ej',
        target_ref: 'M2',
        result: {
          supplied_type: 'integration_time',
          weighted_continuum_sensitivity: {
            value: 107.53904853211655,
            unit: 'uJy / beam'
          },
          weighted_spectral_sensitivity: {
            value: 18.72201668513227,
            unit: 'mJy / beam'
          },
          total_continuum_sensitivity: {
            value: 107.54387002826836,
            unit: 'uJy / beam'
          },
          total_spectral_sensitivity: {
            value: 18.72201701713336,
            unit: 'mJy / beam'
          },
          surface_brightness_sensitivity: {
            continuum: 282.72036408677496,
            spectral: 19489.22259007647,
            unit: 'K'
          }
        },
        continuum_confusion_noise: {
          value: 1.0183425082744668,
          unit: 'uJy / beam'
        },
        synthesized_beam_size: {
          continuum: '3.85 x 3.02',
          spectral: '5.84 x 5.02',
          unit: 'arcsec²'
        },
        spectral_confusion_noise: {
          value: 3.52582756374021,
          unit: 'uJy / beam'
        }
      }
    ]
  }
};

export default MockProposalBackend;
