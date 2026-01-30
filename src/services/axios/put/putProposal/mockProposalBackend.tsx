import { ProposalBackend } from '@utils/types/proposal.tsx';
import {
  SA_AA2,
  BAND_LOW_STR,
  PROPOSAL_STATUS,
  RA_TYPE_ICRS,
  TYPE_ZOOM_LONG
} from '@utils/constants.ts';

export const MockProposalBackend: ProposalBackend = {
  prsl_id: 'prsl-t0001-20250613-00002',
  status: PROPOSAL_STATUS.DRAFT,
  submitted_by: '',
  submitted_on: null,
  investigator_refs: [],
  cycle: 'SKA_1962_2024',
  proposal_info: {
    title: 'New Proposal test2',
    proposal_type: {
      main_type: 'standard_proposal',
      attributes: ['coordinated_proposal']
    },
    abstract: 'My scienceTest abstract',
    science_category: 'Cosmology',
    investigators: []
  },
  observation_info: {
    targets: [
      {
        target_id: 'target',
        name: 'target',
        reference_coordinate: {
          kind: RA_TYPE_ICRS.label,
          ra_str: '00:00:00.0',
          dec_str: '00:00:00.0',
          epoch: 2000,
          parallax: undefined,
          pm_ra: undefined,
          pm_dec: undefined
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km/s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      },
      {
        target_id: 'target2',
        name: 'target2',
        reference_coordinate: {
          kind: RA_TYPE_ICRS.label,
          ra_str: '05:34:30.900',
          dec_str: '+22:00:53.000',
          epoch: 2000,
          parallax: undefined,
          pm_ra: undefined,
          pm_dec: undefined
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km/s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      },
      {
        target_id: 'M2',
        name: 'M2',
        reference_coordinate: {
          kind: RA_TYPE_ICRS.label,
          ra_str: '21:33:27.0200',
          dec_str: '-00:49:23.700',
          epoch: 2000,
          parallax: undefined,
          pm_ra: undefined,
          pm_dec: undefined
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km/s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      }
    ],
    data_product_src_nets: [],
    documents: [],
    observation_sets: [
      {
        observation_set_id: 'obs-obR1Ej',
        observing_band: BAND_LOW_STR,
        elevation: 20,
        group_id: '',
        array_details: {
          array: 'ska_low',
          subarray: SA_AA2,
          number_of_stations: 68
        },
        observation_type_details: {
          observation_type: 'continuum',
          bandwidth: {
            value: 150,
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
          }
          // spectral_resolution: '5.43 kHz (8.1 km/s)',
          // effective_resolution: '5.43 kHz (8.1 km/s)',
          // spectral_averaging: '1'
        }
      }
    ],
    data_product_sdps: [
      {
        data_product_id: 'SDP-2',
        script_parameters: {
          variant: 'continuum image',
          kind: 'continuum',
          channels_out: 1,
          gaussian_taper: '1',
          polarisations: ['I'],
          image_size: {
            value: 15,
            unit: 'deg'
          },
          image_cellsize: {
            value: 1.007,
            unit: 'arcsec'
          },
          weight: {
            weighting: 'uniform'
          }
        },
        observation_set_ref: 'obs-obR1Ej'
      }
    ],
    calibration_strategy: [
      {
        observatory_defined: true,
        calibration_id: 'cal-001',
        observation_set_ref: 'obs-obR1Ej',
        calibrators: null,
        notes: 'This is an observatory defined calibration strategy.'
      }
    ],
    result_details: [
      {
        observation_set_ref: 'obs-obR1Ej',
        data_product_ref: 'SDP-2',
        target_ref: 'M2',
        result: {
          supplied_type: 'integration_time',
          weighted_continuum_sensitivity: {
            value: 107.53904853211655,
            unit: 'μJy/beam'
          },
          weighted_spectral_sensitivity: {
            value: 18.72201668513227,
            unit: 'mJy/beam'
          },
          total_continuum_sensitivity: {
            value: 107.54387002826836,
            unit: 'μJy/beam'
          },
          total_spectral_sensitivity: {
            value: 18.72201701713336,
            unit: 'mJy/beam'
          },
          surface_brightness_sensitivity: {
            continuum: 282.72036408677496,
            spectral: 19489.22259007647,
            unit: 'K'
          }
        },
        continuum_confusion_noise: {
          value: 1.0183425082744668,
          unit: 'μJy/beam'
        },
        synthesized_beam_size: {
          continuum: '3.85 x 3.02',
          spectral: '5.84 x 5.02',
          unit: 'arcsec²'
        },
        spectral_confusion_noise: {
          value: 3.52582756374021,
          unit: 'μJy/beam'
        }
      }
    ]
  }
};

export const MockProposalBackendZoom: ProposalBackend = {
  prsl_id: 'prsl-t0001-20250624-00049',
  status: PROPOSAL_STATUS.DRAFT,
  submitted_by: '',
  submitted_on: null,
  investigator_refs: [],
  cycle: 'SKA_1962_2024',
  proposal_info: {
    title: 'Proposal Zoom',
    proposal_type: {
      attributes: [],
      main_type: 'key_science_proposal'
    },
    abstract: 'My zoom abstract.',
    science_category: 'High Energy Cosmic Particles',
    investigators: []
  },
  observation_info: {
    targets: [
      {
        target_id: 'm2',
        name: 'm2',
        reference_coordinate: {
          kind: RA_TYPE_ICRS.label,
          ra_str: '21:33:27.0200',
          dec_str: '-00:49:23.700',
          epoch: 2000
        },
        radial_velocity: {
          quantity: {
            value: 0,
            unit: 'km/s'
          },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      }
    ],
    observation_sets: [
      {
        observation_set_id: 'obs-arMIoY',
        observing_band: BAND_LOW_STR,
        elevation: 20,
        array_details: {
          array: 'ska_low',
          subarray: SA_AA2,
          number_of_stations: 68
        },
        observation_type_details: {
          observation_type: TYPE_ZOOM_LONG,
          bandwidth: {
            value: 24.4140625,
            unit: 'kHz'
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
          spectral_resolution: '14.13 Hz (21.2 m/s)',
          effective_resolution: '14.13 Hz (21.2 m/s)',
          spectral_averaging: '1',
          number_of_channels: '1024'
        }
      }
    ],
    data_product_sdps: [
      {
        data_product_id: 'SDP-1',
        observation_set_ref: 'obs-arMIoY',
        script_parameters: {
          variant: 'continuum image',
          kind: 'continuum',
          channels_out: 1,
          gaussian_taper: '1',
          polarisations: ['I'],
          image_size: {
            value: 100,
            unit: 'deg2'
          },
          image_cellsize: {
            value: 3.7,
            unit: 'arcsec2'
          },
          weight: {
            weighting: 'briggs',
            robust: 2
          }
        }
      }
    ],
    calibration_strategy: [
      {
        observatory_defined: true,
        calibration_id: 'cal-002',
        observation_set_ref: 'obs-arMIoY',
        calibrators: null,
        notes: 'This is an other observatory defined calibration strategy.'
      }
    ],
    result_details: [
      {
        observation_set_ref: 'obs-arMIoY',
        data_product_ref: 'SDP-2',
        target_ref: 'm2',
        result: {
          supplied_type: 'integration_time',
          weighted_continuum_sensitivity: {
            unit: '',
            value: 0
          },
          weighted_spectral_sensitivity: {
            value: 29.69626339640881,
            unit: 'mJy/beam'
          },
          total_continuum_sensitivity: {
            unit: '',
            value: 0
          },
          total_spectral_sensitivity: {
            value: 29.696271681672012,
            unit: 'mJy/beam'
          },
          surface_brightness_sensitivity: {
            continuum: 0,
            spectral: 6071.553983562558,
            unit: 'K'
          }
        },
        continuum_confusion_noise: {
          value: 0,
          unit: ''
        },
        synthesized_beam_size: {
          continuum: 'dummy',
          spectral: '13.47 x 11.10',
          unit: 'arcsec²'
        },
        spectral_confusion_noise: {
          value: 22.18293905542935,
          unit: 'μJy/beam'
        }
      }
    ],
    documents: [],
    data_product_src_nets: []
  }
};
