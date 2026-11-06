import { ProposalBackend } from '@utils/types/proposal.tsx';

// A PDM covering the variants the targets, links and calibration mappers handle: each coordinate
// kind, each observation type, results supplied as integration time and as sensitivity, a link
// without results, and calibration with and without calibrators.

const observationSet = (id: string, observationTypeDetails: object) => ({
  observation_set_id: id,
  observing_band: 'low_band',
  elevation: 20,
  array_details: { array: 'ska_low', subarray: 'aa2_sv', number_of_stations: 68 },
  observation_type_details: {
    bandwidth: { value: 150, unit: 'MHz' },
    central_frequency: { value: 200, unit: 'MHz' },
    supplied: { supplied_type: 'integration_time', quantity: { value: 1, unit: 'h' } },
    ...observationTypeDetails
  }
});

const integrationTimeResult = {
  supplied_type: 'integration_time',
  weighted_continuum_sensitivity: { value: 107.5, unit: 'μJy/beam' },
  weighted_spectral_sensitivity: { value: 18.7, unit: 'mJy/beam' },
  total_continuum_sensitivity: { value: 107.6, unit: 'μJy/beam' },
  total_spectral_sensitivity: { value: 18.8, unit: 'mJy/beam' },
  surface_brightness_sensitivity: { continuum: 282.7, spectral: 19489.2, unit: 'K' }
};

const noise = {
  continuum_confusion_noise: { value: 1.02, unit: 'μJy/beam' },
  synthesized_beam_size: { continuum: '3.85 x 3.02', spectral: '5.84 x 5.02', unit: 'arcsec²' },
  spectral_confusion_noise: { value: 3.53, unit: 'μJy/beam' }
};

export const MockSlicesPdm = {
  prsl_id: 'prsl-t0001-20261030-00001',
  status: 'draft',
  submitted_by: '',
  submitted_on: null,
  cycle: 'SKA_1962_2024',
  investigator_refs: [],
  proposal_info: {
    title: 'Slice mapping fixture',
    proposal_type: { main_type: 'standard_proposal', attributes: [] },
    abstract: 'Covers the slice mapping variants.',
    science_category: 'Cosmology',
    investigators: []
  },
  observation_info: {
    targets: [
      {
        target_id: 'target-icrs',
        name: 'M2',
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            { kind: 'SinglePointParameters', offset_x_arcsec: 0.5, offset_y_arcsec: 0.5 }
          ]
        },
        reference_coordinate: {
          kind: 'icrs',
          ra_str: '21:33:27.0200',
          dec_str: '-00:49:23.700',
          pm_ra: 1.5,
          pm_dec: -2.5,
          parallax: 0.1,
          epoch: 2000
        },
        radial_velocity: {
          quantity: { value: 25, unit: 'km/s' },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      },
      {
        target_id: 'target-galactic',
        name: 'Galactic source',
        reference_coordinate: {
          kind: 'galactic',
          l: 12.5,
          b: -3.25,
          pm_l: 0.5,
          pm_b: 0.25,
          epoch: 2000
        },
        radial_velocity: {
          quantity: { value: 0, unit: 'm/s' },
          definition: 'OPTICAL',
          reference_frame: 'BARYCENTRIC',
          redshift: 0.5
        }
      },
      {
        target_id: 'target-sso',
        name: 'Jupiter',
        reference_coordinate: { kind: 'special', name: 'Jupiter' },
        radial_velocity: {
          quantity: { value: 0, unit: 'km/s' },
          definition: 'RADIO',
          reference_frame: 'LSRK',
          redshift: 0
        }
      }
    ],
    documents: [],
    data_product_sdps: [],
    data_product_src_nets: [],
    observation_sets: [
      observationSet('obs-continuum', { observation_type: 'continuum' }),
      observationSet('obs-continuum-spectral', {
        observation_type: 'continuum and spectral line',
        supplied: { supplied_type: 'sensitivity', quantity: { value: 10, unit: 'uJy/beam' } }
      }),
      observationSet('obs-spectral', {
        observation_type: 'spectral line',
        spectral_resolution: '5.43 kHz (8.1 km/s)',
        effective_resolution: '5.43 kHz (8.1 km/s)',
        number_of_channels: '1000'
      }),
      observationSet('obs-pst', { observation_type: 'pst', pst_mode: 'detected filterbank' })
    ],
    calibration_strategy: [
      {
        observatory_defined: true,
        calibration_id: 'cal-with-calibrators',
        observation_set_ref: 'obs-continuum',
        calibrators: [
          { kind: 'flux', name: '3C286' },
          { kind: 'flux', name: '3C48' }
        ],
        notes: null
      },
      {
        observatory_defined: false,
        calibration_id: 'cal-without-calibrators',
        observation_set_ref: 'obs-pst',
        calibrators: null,
        notes: 'User defined calibration.'
      }
    ],
    result_details: [
      {
        observation_set_ref: 'obs-continuum',
        target_ref: 'target-icrs',
        data_product_ref: 'SDP-continuum',
        result: integrationTimeResult,
        ...noise
      },
      {
        observation_set_ref: 'obs-continuum-spectral',
        target_ref: 'target-galactic',
        data_product_ref: 'SDP-continuum-spectral',
        result: {
          supplied_type: 'sensitivity',
          continuum: { value: 2.5, unit: 'h' },
          spectral: { value: 3.5, unit: 'h' }
        },
        ...noise
      },
      {
        observation_set_ref: 'obs-spectral',
        target_ref: 'target-sso',
        data_product_ref: 'SDP-spectral',
        result: integrationTimeResult,
        ...noise
      },
      {
        observation_set_ref: 'obs-pst',
        target_ref: 'target-icrs',
        data_product_ref: 'SDP-pst',
        result: integrationTimeResult,
        ...noise
      },
      {
        observation_set_ref: 'obs-continuum',
        target_ref: 'target-galactic',
        data_product_ref: 'SDP-continuum',
        result: null,
        continuum_confusion_noise: null,
        spectral_confusion_noise: null,
        synthesized_beam_size: null
      }
    ]
  }
} as unknown as ProposalBackend;
