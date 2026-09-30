import {
  BAND_1_STR,
  BAND_LOW_STR,
  PROPOSAL_STATUS,
  PROPOSAL_TYPE,
  PROPOSAL_SUBTYPE,
  REFERENCE_COORDINATE_TYPE_ICRS,
  SA_AA2,
  TYPE_CONTINUUM,
  TYPE_ZOOM_LONG
} from '@/utils/constants';
import { ProposalBackend } from '@/utils/types/proposal';
import { Metadata } from '@/utils/types/metadata';
import { InvestigatorBackend } from '@/utils/types/investigator';
import { TargetBackend } from '@/utils/types/target';
import { DocumentBackend } from '@/utils/types/document';
import { ObservationSetBackend } from '@/utils/types/observationSet';
import { DataProductSDPsBackend } from '@/utils/types/dataProduct';
import { CalibrationStrategyBackend } from '@/utils/types/calibrationStrategy';
import { ResultsDetailsBackend } from '@/utils/types/sensCalcResults';

const TIMESTAMP = '2022-09-23T15:43:53.971548Z';
const ABSTRACT =
  'Pretty Looking frontend depends on hard work put into good wire-framing and requirement gathering';

const metadata: Metadata = {
  version: 1,
  created_by: 'TestUser',
  created_on: TIMESTAMP,
  last_modified_by: 'TestUser',
  last_modified_on: TIMESTAMP,
  pdm_version: '1.0.0'
};

const investigators: InvestigatorBackend[] = [
  {
    user_id: 'prp-ska01-202204-01',
    given_name: 'Tony',
    family_name: 'Bennet',
    email: 'somewhere.vague@example.com',
    organization: '',
    for_phd: false,
    principal_investigator: true,
    status: 'pending',
    officeLocation: null,
    jobTitle: null
  }
];

const target = (targetId: string, raStr: string, decStr: string): TargetBackend => ({
  target_id: targetId,
  name: targetId,
  reference_coordinate: {
    kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
    ra_str: raStr,
    dec_str: decStr,
    epoch: 2000
  },
  radial_velocity: {
    quantity: { value: 0, unit: 'km/s' },
    definition: 'RADIO',
    reference_frame: 'LSRK',
    redshift: 0
  }
});

const targetM28 = target('M28', '18:24:32.89', '-24:52:11.4');
const targetM1 = target('M1', '05:34:31.94', '+22:00:52.2');

const documents: DocumentBackend[] = [
  { document_id: 'doc_ref_01', uploaded_pdf: true },
  { document_id: 'doc_ref_02', uploaded_pdf: true }
];

const lowObservationSet = (id: string, observationType: string): ObservationSetBackend => ({
  observation_set_id: id,
  group_id: '',
  observing_band: BAND_LOW_STR,
  elevation: 20,
  array_details: {
    array: 'ska_low',
    subarray: SA_AA2,
    number_of_stations: 68
  },
  observation_type_details: {
    observation_type: observationType,
    bandwidth: { value: 150, unit: 'MHz' },
    central_frequency: { value: 200, unit: 'MHz' },
    supplied: { supplied_type: 'integration_time', quantity: { value: 1, unit: 'h' } }
  }
});

const midObservationSet = (id: string, observationType: string): ObservationSetBackend => ({
  observation_set_id: id,
  group_id: '',
  observing_band: BAND_1_STR,
  elevation: 15,
  array_details: {
    array: 'ska_mid',
    subarray: SA_AA2,
    weather: 3,
    number_15_antennas: 64,
    number_13_antennas: 4,
    number_sub_bands: 1
  },
  observation_type_details: {
    observation_type: observationType,
    bandwidth: { value: 435, unit: 'MHz' },
    central_frequency: { value: 797.5, unit: 'MHz' },
    supplied: { supplied_type: 'integration_time', quantity: { value: 1, unit: 'h' } }
  }
});

const continuumImage = (observationSetRef: string): DataProductSDPsBackend => ({
  data_product_id: 'SDP-1',
  observation_set_ref: observationSetRef,
  script_parameters: {
    variant: 'continuum image',
    kind: 'continuum',
    channels_out: 1,
    gaussian_taper: '1',
    polarisations: ['I'],
    image_size: { value: 15, unit: 'deg' },
    image_cellsize: { value: 1.007, unit: 'arcsec' },
    weight: { weighting: 'uniform' }
  }
});

const observatoryCalibration = (observationSetRef: string): CalibrationStrategyBackend => ({
  observatory_defined: true,
  calibration_id: 'cal-001',
  observation_set_ref: observationSetRef,
  calibrators: null,
  notes: 'This is an observatory defined calibration strategy.'
});

const continuumResult = (observationSetRef: string, targetRef: string): ResultsDetailsBackend => ({
  observation_set_ref: observationSetRef,
  data_product_ref: 'SDP-1',
  target_ref: targetRef,
  result: {
    supplied_type: 'integration_time',
    weighted_continuum_sensitivity: { value: 107.54, unit: 'μJy/beam' },
    weighted_spectral_sensitivity: { value: 18.72, unit: 'mJy/beam' },
    total_continuum_sensitivity: { value: 107.54, unit: 'μJy/beam' },
    total_spectral_sensitivity: { value: 18.72, unit: 'mJy/beam' },
    surface_brightness_sensitivity: { continuum: 282.72, spectral: 19489.22, unit: 'K' }
  },
  continuum_confusion_noise: { value: 1.02, unit: 'μJy/beam' },
  synthesized_beam_size: { continuum: '3.85 x 3.02', spectral: '5.84 x 5.02', unit: 'arcsec²' },
  spectral_confusion_noise: { value: 3.53, unit: 'μJy/beam' }
});

// A standard proposal using both telescopes, with continuum and zoom observations on each
const standardObservationInfo: ProposalBackend['observation_info'] = {
  targets: [targetM28, targetM1],
  documents,
  observation_sets: [
    midObservationSet('mid-001', TYPE_CONTINUUM),
    midObservationSet('mid-002', TYPE_ZOOM_LONG),
    lowObservationSet('low-001', TYPE_CONTINUUM),
    lowObservationSet('low-002', TYPE_ZOOM_LONG)
  ],
  calibration_strategy: [observatoryCalibration('low-001')],
  data_product_sdps: [continuumImage('low-001')],
  data_product_src_nets: [{ data_products_src_id: '2' }],
  result_details: [continuumResult('low-001', targetM28.target_id)]
};

const MockProposalBackendList: ProposalBackend[] = [
  {
    prsl_id: 'prp-ska01-202204-02',
    status: PROPOSAL_STATUS.DRAFT,
    submitted_on: TIMESTAMP,
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata,
    cycle: 'SKA_2026_1',
    proposal_info: {
      title: 'In a galaxy far, far away',
      proposal_type: {
        main_type: PROPOSAL_TYPE.STANDARD,
        attributes: [PROPOSAL_SUBTYPE.COORDINATED]
      },
      abstract: ABSTRACT,
      // Not a known category, so it maps to no science category
      science_category: 'Science Category',
      investigators
    },
    observation_info: standardObservationInfo
  },
  // Science verification: LOW only, no science category, and a single target and observation
  // whose type is the observing mode
  {
    prsl_id: 'prp-ska01-202204-01',
    status: PROPOSAL_STATUS.SUBMITTED,
    submitted_on: TIMESTAMP,
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata,
    cycle: 'SKAO_2027_1',
    proposal_info: {
      title: 'The Milky Way View',
      proposal_type: {
        main_type: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
        attributes: []
      },
      abstract: ABSTRACT,
      investigators
    },
    observation_info: {
      targets: [targetM28],
      documents,
      observation_sets: [lowObservationSet('low-001', TYPE_CONTINUUM)],
      calibration_strategy: [observatoryCalibration('low-001')],
      data_product_sdps: [continuumImage('low-001')],
      data_product_src_nets: [],
      result_details: [continuumResult('low-001', targetM28.target_id)]
    }
  },
  {
    prsl_id: 'prsl-t0001-20250814-00002',
    status: PROPOSAL_STATUS.SUBMITTED,
    submitted_on: TIMESTAMP,
    submitted_by: 'TestUser',
    investigator_refs: ['prp-ska01-202204-01'],
    metadata,
    cycle: 'SKA_2026_1',
    proposal_info: {
      title: 'Incomplete Proposal',
      proposal_type: {
        main_type: PROPOSAL_TYPE.STANDARD
      },
      abstract: ABSTRACT,
      science_category: 'Extragalactic continuum',
      investigators
    },
    observation_info: standardObservationInfo
  }
];

export default MockProposalBackendList;
