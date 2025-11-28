import Target, {
  Beam,
  BeamBackend,
  ReferenceCoordinateGalactic,
  ReferenceCoordinateGalacticBackend,
  ReferenceCoordinateICRS,
  ReferenceCoordinateICRSBackend,
  TargetBackend
} from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import { ObservationSetBackend } from '@utils/types/observationSet.tsx';
import GroupObservation from '@utils/types/groupObservation.tsx';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from '@utils/types/arrayDetails.tsx';
import { ValueUnitPair } from '@utils/types/valueUnitPair.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import { SensCalcResultsBackend } from '@utils/types/sensCalcResults.tsx';
import {
  BANDWIDTH_TELESCOPE,
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  FREQUENCY_UNITS,
  GENERAL,
  IMAGE_WEIGHTING,
  IW_BRIGGS,
  PROJECTS,
  PROPOSAL_STATUS,
  PST_MODES,
  PULSAR_TIMING_VALUE,
  RA_TYPE_GALACTIC,
  RA_TYPE_ICRS,
  ROBUST,
  SCIENCE_VERIFICATION,
  TELESCOPE_LOW_BACKEND_MAPPING,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_STR_CONTINUUM,
  TYPE_STR_PST,
  TYPE_STR_ZOOM,
  TYPE_ZOOM,
  VEL_UNITS,
  VELOCITY_TYPE
} from '@utils/constants.ts';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '@utils/types/dataProduct.tsx';
import { DocumentBackend, DocumentPDF } from '@utils/types/document.tsx';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import { getUserId } from '@utils/aaa/aaaUtils.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import { MockProposalBackend } from './mockProposalBackend';
import { getBandwidthZoom, helpers } from '@/utils/helpers';
import { CalibrationStrategy, CalibrationStrategyBackend } from '@/utils/types/calibrationStrategy';
import { SuppliedBackend } from '@/utils/types/supplied';

const isContinuum = (type: number) => type === TYPE_CONTINUUM;
// const isPST = (type: number) => type === TYPE_PST;
// const isZoom = (type: number) => type === TYPE_ZOOM;
const isVelocity = (type: number) => type === VELOCITY_TYPE.VELOCITY;
const isRedshift = (type: number) => type === VELOCITY_TYPE.REDSHIFT;
const userId = getUserId();

const getSubType = (proposalType: number, proposalSubType: number[]): any => {
  const project = PROJECTS.find(({ id }) => id === proposalType);
  const subTypes: string[] = [];
  for (let subtype of proposalSubType) {
    if (subtype && project) {
      subTypes.push(project.subProjects.find(item => item.id === subtype)?.mapping as string);
    }
  }
  return subTypes;
};

export const getReferenceCoordinate = (
  tar: Target | ReferenceCoordinateICRS | ReferenceCoordinateGalactic
): ReferenceCoordinateICRSBackend | ReferenceCoordinateGalacticBackend => {
  if ('kind' in tar && tar.kind === RA_TYPE_GALACTIC.value) {
    return {
      kind: RA_TYPE_GALACTIC.label,
      l: (tar as Target).l,
      b: (tar as Target).b,
      pm_l: (tar as Target).pmL,
      pm_b: (tar as Target).pmB,
      epoch: tar.epoch,
      parallax: tar.parallax
    } as ReferenceCoordinateGalacticBackend;
  }
  return {
    kind: RA_TYPE_ICRS.label,
    ra_str: ((tar as Target) || (tar as ReferenceCoordinateICRS)).raStr,
    dec_str: ((tar as Target) || (tar as ReferenceCoordinateICRS)).decStr,
    pm_ra: ((tar as Target) || (tar as ReferenceCoordinateICRS)).pmRa,
    pm_dec: ((tar as Target) || (tar as ReferenceCoordinateICRS)).pmDec,
    epoch: ((tar as Target) || (tar as ReferenceCoordinateICRS)).epoch,
    parallax: ((tar as Target) || (tar as ReferenceCoordinateICRS)).parallax
  } as ReferenceCoordinateICRSBackend;
};

const getBeam = (beam: Beam): BeamBackend => {
  return {
    beam_id: beam.id,
    beam_name: beam.beamName,
    beam_coordinate: getReferenceCoordinate(beam.beamCoordinate),
    stn_weights: beam.stnWeights ?? [] // not used yet
  };
};

const getTargets = (targets: Target[]): TargetBackend[] => {
  const mappedTargets = targets.map(tar => ({
    name: tar.name,
    target_id: tar.name,
    reference_coordinate: getReferenceCoordinate(tar),
    radial_velocity: {
      quantity: {
        value: isVelocity(tar.velType) ? Number(tar.vel) : 0,
        unit: VEL_UNITS.find(u => u.value === Number(tar.velUnit))?.label ?? ''
      },
      definition: 'RADIO',
      reference_frame: tar.raReferenceFrame ?? 'LSRK',
      redshift: isRedshift(tar.velType) ? Number(tar.redshift) : 0
    },
    tied_array_beams: {
      pst_beams:
        tar.tiedArrayBeams && Array.isArray(tar.tiedArrayBeams.pstBeams)
          ? tar.tiedArrayBeams.pstBeams.map((beam: Beam) => getBeam(beam))
          : [],
      pss_beams:
        tar.tiedArrayBeams &&
        Array.isArray(tar.tiedArrayBeams.pssBeams) &&
        tar.tiedArrayBeams.pssBeams
          ? tar.tiedArrayBeams.pssBeams.map((beam: Beam) => getBeam(beam))
          : [],
      vlbi_beams:
        tar.tiedArrayBeams &&
        Array.isArray(tar.tiedArrayBeams.vlbiBeams) &&
        tar.tiedArrayBeams.vlbiBeams
          ? tar.tiedArrayBeams.vlbiBeams.map((beam: Beam) => getBeam(beam))
          : []
    }
  }));
  return mappedTargets;
};

const getDocuments = (
  sciencePDF: DocumentPDF | null,
  technicalPDF: DocumentPDF | null
): DocumentBackend[] => {
  const documents = [];
  if (sciencePDF) {
    documents.push({
      document_id: sciencePDF.documentId,
      uploaded_pdf: sciencePDF.isUploadedPdf
    });
  }
  if (technicalPDF) {
    documents.push({
      document_id: technicalPDF.documentId,
      uploaded_pdf: technicalPDF.isUploadedPdf
    });
  }
  return documents;
};

export const getCalibrationStrategy = (
  calibrationStrategies: CalibrationStrategy[]
): CalibrationStrategyBackend[] => {
  return calibrationStrategies?.map(strategy => ({
    observatory_defined: strategy.observatoryDefined,
    calibration_id: strategy.id,
    observation_set_ref: strategy.observationIdRef,
    calibrators: strategy.calibrators
      ? strategy?.calibrators?.map(calibrator => ({
          calibration_intent: calibrator.calibrationIntent,
          name: calibrator.name,
          duration_min: calibrator.durationMin,
          choice: calibrator.choice,
          notes: calibrator.notes
        }))
      : null,
    notes: strategy.notes
  }));
};

export const getDataProductScriptParameters = (obs: Observation[] | null, dp: DataProductSDP) => {
  const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];
  const obType = obs?.find(o => o.id === dp.observationId)?.type;
  switch (obType) {
    case TYPE_CONTINUUM: {
      if (dp.dataProductType === DP_TYPE_IMAGES) {
        return {
          image_size: { value: dp.imageSizeValue, unit: IMAGE_SIZE_UNITS[dp?.imageSizeUnits] },
          image_cellsize: { value: dp.pixelSizeValue, unit: IMAGE_SIZE_UNITS[dp?.pixelSizeUnits] },
          weight: {
            weighting: IMAGE_WEIGHTING.find(item => item.value === Number(dp.weighting))
              ?.label as string,
            ...(Number(dp.weighting) === IW_BRIGGS && {
              robust: ROBUST.find(item => item.value === dp.robust)?.value
            })
          },
          polarisations: dp.polarisations,
          channels_out: dp.channelsOut,
          fit_spectral_pol: dp.fitSpectralPol,
          gaussian_taper: dp.taperValue?.toString(),
          kind: 'continuum',
          variant: 'continuum image'
        };
      } else {
        return {
          image_size: { value: dp.imageSizeValue, unit: IMAGE_SIZE_UNITS[dp.imageSizeUnits] },
          image_cellsize: { value: dp.pixelSizeValue, unit: IMAGE_SIZE_UNITS[dp.pixelSizeUnits] },
          weight: {
            weighting: IMAGE_WEIGHTING.find(item => item.value === Number(dp.weighting))
              ?.label as string,
            ...(Number(dp.weighting) === IW_BRIGGS && {
              robust: ROBUST.find(item => item.value === dp.robust)?.value
            })
          },
          polarisations: dp.polarisations,
          channels_out: dp.channelsOut,
          fit_spectral_pol: dp.fitSpectralPol,
          gaussian_taper: dp.taperValue?.toString(),
          time_averaging: { value: dp.timeAveraging, unit: '' },
          frequency_averaging: { value: dp.frequencyAveraging, unit: '' },
          kind: 'continuum',
          variant: 'visibilities'
        };
      }
    }
    case TYPE_ZOOM:
      return {
        image_size: { value: dp.imageSizeValue, unit: IMAGE_SIZE_UNITS[dp.imageSizeUnits] },
        image_cellsize: { value: dp.pixelSizeValue, unit: IMAGE_SIZE_UNITS[dp.pixelSizeUnits] },
        weight: {
          weighting: IMAGE_WEIGHTING.find(item => item.value === Number(dp.weighting))
            ?.label as string,
          ...(Number(dp.weighting) === IW_BRIGGS && {
            robust: ROBUST.find(item => item.value === dp.robust)?.value
          })
        },
        polarisations: dp.polarisations,
        channels_out: dp.channelsOut,
        fit_spectral_pol: dp.fitSpectralPol,
        gaussian_taper: dp.taperValue?.toString(),
        kind: 'spectral',
        variant: 'spectral image',
        continuum_subtraction: dp.continuumSubtraction
      };
    case TYPE_PST:
    default:
      const pstMode = obs?.find(o => o.id === dp.observationId)?.pstMode;
      if (pstMode === DETECTED_FILTER_BANK_VALUE) {
        return {
          polarisation: dp.polarisations,
          bit_depth: Number(dp.bitDepth),
          time_averaging_factor: dp.timeAveraging,
          frequency_averaging_factor: dp.frequencyAveraging,
          kind: 'pst',
          variant: 'detected filterbank'
        };
      } else if (pstMode === PULSAR_TIMING_VALUE) {
        return {
          polarisation: dp.polarisations,
          bit_depth: dp.bitDepth,
          kind: 'pst',
          variant: 'pulsar timing'
        };
      } else {
        return {
          polarisation: dp.polarisations,
          bit_depth: dp.bitDepth,
          kind: 'pst',
          variant: 'flow through'
        };
      }
  }
};

const getDataProductSDP = (
  obs: Observation[] | null,
  dataProducts: DataProductSDP[]
): DataProductSDPsBackend[] => {
  const sdp = dataProducts?.map(dp => ({
    data_product_id: dp.id?.toString(),
    observation_set_ref: dp.observationId,
    script_parameters: getDataProductScriptParameters(obs, dp)
  }));
  return sdp;
};

export const getDataProductSRC = (dataProducts: DataProductSRC[]): DataProductSRCNetBackend[] => {
  return dataProducts?.map(dp => ({ data_products_src_id: dp?.id }));
};

const getGroupObservation = (obsId: string, observationGroups: GroupObservation[] | undefined) => {
  const groupId = observationGroups
    ? observationGroups.find(group => group.observationId === obsId)?.observationId
    : '';
  return groupId ? groupId : '';
};

const getObservingBand = (observingBand: number) => {
  const obsBand = BANDWIDTH_TELESCOPE.find(band => band.value === observingBand)?.mapping;
  return obsBand;
};

const getSubArray = (incSubArray: number, incTelescope: number): string => {
  const array = OSD_CONSTANTS.array.find(a => a.value === incTelescope);
  const subArray = array?.subarray
    ?.find(sub => sub.value === incSubArray)
    ?.label?.toLocaleLowerCase();
  return subArray ? subArray : 'aa4'; // TODO : fallback needs to be moved to a constant
};

const getArrayDetails = (incObs: Observation): ArrayDetailsLowBackend | ArrayDetailsMidBackend => {
  if (incObs.telescope === TELESCOPE_LOW_NUM) {
    const lowArrayDetails: ArrayDetailsLowBackend = {
      array: TELESCOPE_LOW_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      number_of_stations: incObs.numStations
    };
    return lowArrayDetails;
  } else {
    const midArrayDetails: ArrayDetailsMidBackend = {
      array: TELESCOPE_MID_BACKEND_MAPPING,
      subarray: getSubArray(incObs.subarray, incObs.telescope),
      weather: incObs.weather,
      number_15_antennas: incObs.num15mAntennas,
      number_13_antennas: incObs.num13mAntennas,
      number_sub_bands: incObs.numSubBands,
      tapering: incObs.tapering?.toString()
    };
    return midArrayDetails;
  }
};

const getFrequencyAndBandwidthUnits = (incUnitValue: number): string => {
  return FREQUENCY_UNITS.find(u => u.value === incUnitValue)?.mapping as string;
};

const getBandwidthContinuum = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.continuumBandwidth as number,
    unit: getFrequencyAndBandwidthUnits(incObs.continuumBandwidthUnits as number)
  };
};

const getBandwidth = (ob: Observation): ValueUnitPair =>
  isContinuum(ob.type) ? getBandwidthContinuum(ob) : getBandwidthZoom(ob);

const getCentralFrequency = (incObs: Observation): ValueUnitPair => {
  return {
    value: incObs.centralFrequency,
    unit: getFrequencyAndBandwidthUnits(incObs.centralFrequencyUnits)
  };
};

const getSupplied = (inObs: Observation) => {
  const supplied = OSD_CONSTANTS.Supplied.find(s => s.value === inObs?.supplied?.type);
  return {
    supplied_type: supplied?.mappingLabel,
    quantity: {
      value: inObs.supplied?.value,
      unit: supplied?.units?.find(u => u.value === inObs?.supplied?.units)?.label
    }
  };
};

export const getObservationTypeDetails = (obs: Observation) => {
  switch (obs.type) {
    case TYPE_CONTINUUM:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedBackend,
        observation_type: TYPE_STR_CONTINUUM
      };
    case TYPE_ZOOM:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedBackend,
        observation_type: TYPE_STR_ZOOM,
        spectral_resolution: obs.spectralResolution,
        effective_resolution: obs.effectiveResolution,
        spectral_averaging: obs.spectralAveraging?.toString(),
        number_of_channels: '1024' // TODO : Need to get right value from PDM/UI
      };
    case TYPE_PST:
    default:
      return {
        bandwidth: getBandwidth(obs),
        central_frequency: getCentralFrequency(obs),
        supplied: getSupplied(obs) as SuppliedBackend,
        observation_type: TYPE_STR_PST,
        pst_mode: typeof obs.pstMode !== 'undefined' ? PST_MODES[obs.pstMode].mapping : undefined
      };
  }
};

const getObservationsSets = (
  incObservationsSets: Observation[] | undefined,
  incObservationGroups: GroupObservation[] | undefined
): ObservationSetBackend[] => {
  const outObservationsSets = [];
  if (incObservationsSets) {
    for (let obs of incObservationsSets) {
      const observation: ObservationSetBackend = {
        observation_set_id: obs.id,
        group_id: getGroupObservation(obs.id, incObservationGroups),
        elevation: obs.elevation,
        observing_band: getObservingBand(obs.observingBand) as string,
        array_details: getArrayDetails(obs),
        observation_type_details: getObservationTypeDetails(obs)
      };
      outObservationsSets.push(observation);
    }
  }
  return outObservationsSets;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/
/**************************** supplied fields *****************************/

interface SuppliedRelatedFields {
  supplied_type: string;
  /* sensitivity fields */
  weighted_continuum_sensitivity?: ValueUnitPair;
  weighted_spectral_sensitivity?: ValueUnitPair;
  total_continuum_sensitivity?: ValueUnitPair;
  total_spectral_sensitivity?: ValueUnitPair;
  surface_brightness_sensitivity?: { continuum: number; spectral: number; unit: string };
  /* integration_time fields */
  continuum?: ValueUnitPair;
  spectral?: ValueUnitPair;
}

// Add an index signature to SensCalcResults type to allow string indexing
// (Place this in the appropriate type definition file, e.g., @utils/types/sensCalcResults.tsx)
/*
export interface SensCalcResults {
  section1?: SensCalcSection[];
  section2?: SensCalcSection[];
  section3?: SensCalcSection[];
  [key: string]: SensCalcSection[] | undefined; // <-- Add this line
}
*/

const getSuppliedFieldsSensitivity = (
  suppliedType: string,
  obsType: number,
  tarObs: TargetObservation,
  spectralSection: string
) => {
  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  params.weighted_continuum_sensitivity = {
    value: isContinuum(obsType)
      ? Number(
          tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumSensitivityWeighted')?.value
        )
      : 0,
    unit: isContinuum(obsType)
      ? (tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumSensitivityWeighted')
          ?.units as string)
      : ''
  };
  params.total_continuum_sensitivity = {
    value: isContinuum(obsType)
      ? Number(
          tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumTotalSensitivity')?.value
        )
      : 0,
    unit: isContinuum(obsType)
      ? (tarObs?.sensCalc?.section1?.find(o => o.field === 'continuumTotalSensitivity')
          ?.units as string)
      : ''
  };

  params.weighted_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSensitivityWeighted')?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSensitivityWeighted')
      ?.units
  };
  params.total_spectral_sensitivity = {
    value: Number(
      tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralTotalSensitivity')?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralTotalSensitivity')?.units
  };
  params.surface_brightness_sensitivity = {
    continuum: isContinuum(obsType)
      ? Number(
          tarObs.sensCalc.section1?.find(o => o.field === 'continuumSurfaceBrightnessSensitivity')
            ?.value
        )
      : 0,
    spectral: Number(
      tarObs.sensCalc[spectralSection]?.find(
        o => o.field === 'spectralSurfaceBrightnessSensitivity'
      )?.value
    ),
    unit: tarObs.sensCalc[spectralSection]?.find(
      o => o.field === 'spectralSurfaceBrightnessSensitivity'
    )?.units
  };
  return params;
};

export const getSuppliedFieldsIntegrationTime = (
  suppliedType: string,
  obsType: number,
  tarObs: TargetObservation
) => {
  const params: SuppliedRelatedFields = {
    supplied_type: suppliedType
  };
  params.continuum = {
    value: isContinuum(obsType) ? Number(tarObs.sensCalc.section3?.[0]?.value) : 0,
    unit: isContinuum(obsType) ? tarObs.sensCalc.section3?.[0]?.units ?? '' : ''
  };

  params.spectral = {
    value: Number(tarObs.sensCalc.section3?.[0]?.value),
    unit: tarObs.sensCalc.section3?.[0]?.units ?? ''
  };
  // TODO : check if it's ok to send the same value for continuum and zoom? Is this not implemented in the UI?
  return params;
};
/***********************************************************/

const getObsType = (incTarObs: TargetObservation, incObs: Observation[]): number => {
  let obs = incObs.find(item => item.id === incTarObs.observationId);
  return obs?.type ?? 0;
};

const getSpectralSection = (obsType: number) => (isContinuum(obsType) ? 'section2' : 'section1');

export const getDataProductRef = (
  incTarObs: TargetObservation,
  incDataProductSDP: DataProductSDP[]
) => {
  // TODO make data product mandatory when sens calc is requested so it's never undefined
  return String(incDataProductSDP.find(dp => dp.observationId === incTarObs.observationId)?.id);
};

const getResults = (
  incTargetObservations: TargetObservation[],
  incObs: Observation[],
  incDataProductSDP: DataProductSDP[],
  incTargets: Target[]
) => {
  // TODO remove mock results and fix sens calc mapping
  if (MockProposalBackend.observation_info?.result_details) {
    const mockResults: SensCalcResultsBackend[] = [
      MockProposalBackend.observation_info?.result_details[0]
    ];
    mockResults[0].data_product_ref = incDataProductSDP[0].id;
    mockResults[0].observation_set_ref = incObs[0].id;
    mockResults[0].target_ref = incTargets[0].name;
    return mockResults;
  } else {
    return [];
  }
  // TODO use below instead of mock
  const resultsArr = [];
  if (incTargetObservations) {
    for (let tarObs of incTargetObservations) {
      if (tarObs.sensCalc?.error) {
        continue;
      }
      const obsType = getObsType(tarObs, incObs); // spectral or continuum
      const spectralSection = getSpectralSection(obsType);
      const suppliedType =
        tarObs?.sensCalc?.section3[0]?.field === 'sensitivity' ? 'sensitivity' : 'integration_time';

      const suppliedRelatedFields =
        suppliedType === 'sensitivity'
          ? getSuppliedFieldsIntegrationTime(suppliedType, obsType, tarObs)
          : getSuppliedFieldsSensitivity(suppliedType, obsType, tarObs, spectralSection);
      let result: SensCalcResultsBackend = {
        observation_set_ref: tarObs.observationId,
        data_product_ref: tarObs.dataProductsSDPId ?? getDataProductRef(tarObs, incDataProductSDP),
        target_ref: tarObs.sensCalc?.title,
        result: {
          supplied_type: suppliedType,
          ...suppliedRelatedFields
        },
        continuum_confusion_noise: {
          value: isContinuum(obsType)
            ? Number(
                tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')?.value
              )
            : 0,
          unit: isContinuum(obsType)
            ? tarObs.sensCalc.section1?.find(o => o.field === 'continuumConfusionNoise')?.units
            : ''
        },
        synthesized_beam_size: {
          spectral: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize')
            ?.value,
          continuum: isContinuum(obsType)
            ? tarObs.sensCalc.section1?.find(o => o.field === 'continuumSynthBeamSize')?.value
            : 'dummy', // TODO: investigate typescript not taking empty string
          unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralSynthBeamSize')
            ?.units
        },
        spectral_confusion_noise: {
          value: Number(
            tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralConfusionNoise')?.value
          ),
          unit: tarObs.sensCalc[spectralSection]?.find(o => o.field === 'spectralConfusionNoise')
            ?.units
        }
      };
      resultsArr.push(result);
    }
  }
  return resultsArr;
};
/*************************************************************************************************************************/

export default function MappingPutProposal(proposal: Proposal, isSV: boolean, status: string) {
  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id,
    status: status,
    submitted_on: status === PROPOSAL_STATUS.SUBMITTED ? new Date().toISOString() : null, // note: null since oso-services 1.1.0  does not support ''
    submitted_by: status === PROPOSAL_STATUS.SUBMITTED ? userId : '',
    investigator_refs: proposal.investigators?.map(investigator => {
      return investigator?.id?.toString();
    }),
    cycle: proposal.cycle,
    proposal_info: {
      title: proposal.title,
      proposal_type: {
        main_type: isSV
          ? SCIENCE_VERIFICATION
          : (PROJECTS.find(item => item.id === proposal.proposalType)?.mapping as string),
        attributes:
          !isSV && proposal.proposalSubType
            ? getSubType(proposal.proposalType, proposal.proposalSubType)
            : []
      },
      abstract: proposal.abstract as string,
      science_category: isSV
        ? (GENERAL.ObservingMode?.find(category => category.value === proposal?.scienceCategory)
            ?.label as string)
        : (GENERAL.ScienceCategory?.find(category => category.value === proposal?.scienceCategory)
            ?.label as string),
      investigators: proposal?.investigators
        ? proposal.investigators.map(investigator => {
            return {
              user_id: investigator.id?.toString(),
              status: investigator.status,
              given_name: investigator.firstName,
              family_name: investigator.lastName,
              email: investigator.email,
              organization: investigator.affiliation,
              for_phd: investigator.phdThesis,
              principal_investigator: investigator.pi,
              officeLocation: investigator.officeLocation,
              jobTitle: investigator.jobTitle
            };
          })
        : null
    },
    observation_info: {
      targets: getTargets(proposal?.targets ? proposal.targets : []),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
      observation_sets: getObservationsSets(proposal.observations, proposal.groupObservations),
      calibration_strategy:
        proposal.calibrationStrategy && proposal.calibrationStrategy.length > 0
          ? getCalibrationStrategy(proposal.calibrationStrategy)
          : [],
      data_product_sdps:
        proposal?.dataProductSDP && proposal?.dataProductSDP?.length > 0
          ? getDataProductSDP(
              proposal.observations as Observation[],
              proposal.dataProductSDP as DataProductSDP[]
            )
          : [],
      data_product_src_nets:
        proposal?.dataProductSRC && proposal?.dataProductSRC?.length > 0
          ? getDataProductSRC(proposal.dataProductSRC as DataProductSRC[])
          : [],
      result_details: getResults(
        proposal.targetObservation as TargetObservation[],
        proposal.observations as Observation[],
        proposal.dataProductSDP as DataProductSDP[],
        proposal.targets as Target[]
      )
    }
  };

  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}
