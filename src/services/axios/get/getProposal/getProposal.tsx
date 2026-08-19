import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import MockProposal from '@services/axios/get/getProposalList/mockProposal.tsx';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from '@utils/types/arrayDetails.tsx';
import {
  ResultsSection,
  SensCalcResults,
  ResultsDetailsBackend
} from '@utils/types/sensCalcResults.tsx';
import Proposal, { ProposalBackend } from '@utils/types/proposal.tsx';
import Target, {
  PointingPatternParams,
  ReferenceCoordinateGalactic,
  ReferenceCoordinateGalacticBackend,
  ReferenceCoordinateICRS,
  ReferenceCoordinateICRSBackend,
  ReferenceCoordinateSSO,
  ReferenceCoordinateSSOBackend,
  TargetBackend
} from '@utils/types/target.tsx';
import Observation from '@utils/types/observation.tsx';
import TargetObservation from '@utils/types/targetObservation.tsx';
import Supplied, { SuppliedBackend } from '@utils/types/supplied.tsx';
import {
  PROJECTS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  DETAILS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_ZOOM,
  VEL_TYPES,
  VEL_UNITS,
  TELESCOPE_MID_BACKEND_MAPPING,
  TELESCOPE_LOW_BACKEND_MAPPING,
  SA_AA2,
  FREQUENCY_UNITS,
  OSO_SERVICES_PROPOSAL_PATH,
  PDF_NAME_PREFIXES,
  REFERENCE_COORDINATE_TYPE_ICRS,
  REFERENCE_COORDINATE_TYPE_GALACTIC,
  isCypress,
  SCIENCE_VERIFICATION,
  SCIENCE_VERIFICATION_TYPE_ID,
  TYPE_PST,
  PST_MODES,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  IMAGE_WEIGHTING,
  IW_BRIGGS,
  ROBUST_DEFAULT,
  FREQUENCY_STR_MHZ,
  BAND_LOW_STR,
  FREQUENCY_STR_GHZ,
  PULSAR_TIMING_VALUE,
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  TYPE_ZOOM_LONG,
  cypressSV,
  REFERENCE_COORDINATE_TYPE_SSO
} from '@utils/constants.ts';
import { DocumentBackend, DocumentPDF } from '@utils/types/document.tsx';
import {
  ObservationSetBackend,
  ObservationTypeDetailsPSTBackend,
  ObservationTypeDetailsSpectralBackend
} from '@utils/types/observationSet.tsx';
import {
  DataProductSDPNew,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '@utils/types/dataProduct.tsx';
import Investigator, { InvestigatorBackend } from '@utils/types/investigator.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import useAxiosAuthClient from '../../axiosAuthClient/axiosAuthClient.tsx';
import { calibratorMapping } from '../getCalibratorList/getCalibratorList.tsx';
import { MockProposalBackend } from './mockProposalBackend.tsx';
import {
  CalibrationStrategy,
  CalibrationStrategyBackend
} from '@/utils/types/calibrationStrategy.tsx';

export const getInvestigators = (inValue: InvestigatorBackend[] | null) => {
  const investigators = [] as Investigator[];
  if (!inValue || inValue.length === 0) {
    return investigators;
  }
  for (let i = 0; i < inValue?.length; i++) {
    investigators.push({
      id: inValue[i].user_id,
      status: inValue[i].status,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      email: inValue[i]?.email,
      affiliation: inValue[i].organization as string,
      phdThesis: inValue[i].for_phd as boolean,
      pi: inValue[i].principal_investigator as boolean,
      officeLocation: inValue[i].officeLocation,
      jobTitle: inValue[i].jobTitle
    });
  }
  return investigators;
};

const getAttributes = (proposalType: {
  main_type: string;
  attributes?: string[];
}): number[] | null => {
  const project = PROJECTS?.find(({ mapping }) => mapping === proposalType.main_type);

  const subProjects = proposalType.attributes
    ?.map((attr) => project?.subProjects?.find(({ mapping }) => mapping === attr))
    ?.filter((sp): sp is { id: number; label: string; mapping: string } => sp !== undefined);

  const result = subProjects?.map(({ id }) => id);
  return result && result.length > 0 ? result : [];
};

export const getScienceCategory = (scienceCat: string) => {
  const cat = DETAILS.ScienceCategory?.find(
    (c) => c.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat === null || cat === undefined ? null : cat;
};

export const getObservingMode = (observingMode: string) => {
  const obsMode = DETAILS.ObservingMode?.find(
    (obsMode) => obsMode.label.toLowerCase() === observingMode?.toLowerCase()
  )?.value;
  return obsMode === null || obsMode === undefined ? null : obsMode;
};

const getPDF = (documents: DocumentBackend[] | null, documentId: string): DocumentPDF | null => {
  if (!documents) return null;

  const documentById = documents.find((document) => document.document_id === documentId);

  if (!documentById) return null;

  return {
    documentId: documentById.document_id,
    isUploadedPdf: documentById.uploaded_pdf
  };
};

export const getVelType = (InDefinition: string) => {
  const velType = VEL_TYPES.find(
    (item) => item.label.toLowerCase() === InDefinition?.toLowerCase()
  )?.value;
  return velType ? velType : 1; // fallback
};

export const getReferenceCoordinate = (
  tar:
    | ReferenceCoordinateICRSBackend
    | ReferenceCoordinateGalacticBackend
    | ReferenceCoordinateSSOBackend
): ReferenceCoordinateICRS | ReferenceCoordinateGalactic | ReferenceCoordinateSSO => {
  switch (tar.kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_ICRS.label,
        raStr: (tar as ReferenceCoordinateICRSBackend).ra_str,
        decStr: (tar as ReferenceCoordinateICRSBackend).dec_str,
        pmRa: (tar as ReferenceCoordinateICRSBackend).pm_ra,
        pmDec: (tar as ReferenceCoordinateICRSBackend).pm_dec,
        epoch: (tar as ReferenceCoordinateICRSBackend).epoch,
        parallax: (tar as ReferenceCoordinateICRSBackend).parallax
      };

    case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_GALACTIC.label,
        l: (tar as ReferenceCoordinateGalacticBackend).l,
        b: (tar as ReferenceCoordinateGalacticBackend).b,
        pmL: (tar as ReferenceCoordinateGalacticBackend).pm_l,
        pmB: (tar as ReferenceCoordinateGalacticBackend).pm_b,
        epoch: (tar as ReferenceCoordinateGalacticBackend).epoch,
        parallax: (tar as ReferenceCoordinateGalacticBackend).parallax
      };

    case REFERENCE_COORDINATE_TYPE_SSO.label:
      return {
        kind: REFERENCE_COORDINATE_TYPE_SSO.label
      };

    default:
      throw new Error(`Unsupported reference coordinate kind: ${tar.kind}`);
  }
};

const getTargetType = (kind: string): number => {
  switch (kind) {
    case REFERENCE_COORDINATE_TYPE_ICRS.label:
      return REFERENCE_COORDINATE_TYPE_ICRS.value;

    case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
      return REFERENCE_COORDINATE_TYPE_GALACTIC.value;

    case REFERENCE_COORDINATE_TYPE_SSO.label:
      return REFERENCE_COORDINATE_TYPE_SSO.value;

    default:
      throw new Error(`Unsupported coordinate type: ${kind}`);
  }
};

const getTargets = (inRec: TargetBackend[]): Target[] => {
  const results = [];
  for (let i = 0; i < inRec?.length; i++) {
    const e = inRec[i];
    const referenceCoordinate = e.reference_coordinate.kind;
    const target: Partial<Target> = {
      kind: getTargetType(referenceCoordinate),
      epoch: e?.reference_coordinate?.epoch,
      parallax: e?.reference_coordinate?.parallax,
      id: e.target_id,
      name: e?.name,
      b: undefined,
      l: undefined,
      redshift: e.radial_velocity.redshift.toString(),
      raReferenceFrame: e.radial_velocity.reference_frame,
      raDefinition: e.radial_velocity.definition,
      velType: getVelType(e.radial_velocity.definition),
      vel: e.radial_velocity.quantity?.value?.toString(),
      velUnit: VEL_UNITS.find(
        (u) => u.label === e.radial_velocity?.quantity?.unit?.split(' ').join('')
      )?.value as number,
      pointingPattern: {
        active: e.pointing_pattern?.active as string,
        parameters: e.pointing_pattern?.parameters?.map((p) => ({
          kind: p.kind,
          offsetXArcsec: p.offset_x_arcsec,
          offsetYArcsec: p.offset_y_arcsec
        })) as PointingPatternParams[]
      }
    };
    /*------- reference coordinate properties --------------------- */

    switch (referenceCoordinate) {
      case REFERENCE_COORDINATE_TYPE_ICRS.label:
        target.raStr = (e.reference_coordinate as ReferenceCoordinateICRSBackend).ra_str;
        target.decStr = (e.reference_coordinate as ReferenceCoordinateICRSBackend).dec_str;
        target.pmRa = (e.reference_coordinate as ReferenceCoordinateICRSBackend).pm_ra;
        target.pmDec = (e.reference_coordinate as ReferenceCoordinateICRSBackend).pm_dec;
        break;

      case REFERENCE_COORDINATE_TYPE_GALACTIC.label:
        target.l = (e.reference_coordinate as ReferenceCoordinateGalacticBackend).l;
        target.b = (e.reference_coordinate as ReferenceCoordinateGalacticBackend).b;
        target.pmL = (e.reference_coordinate as ReferenceCoordinateGalacticBackend).pm_l;
        target.pmB = (e.reference_coordinate as ReferenceCoordinateGalacticBackend).pm_b;
        break;

      case REFERENCE_COORDINATE_TYPE_SSO.label:
        break;

      default:
        throw new Error(`Unsupported coordinate type ${referenceCoordinate}`);
    }
    /*------- end of reference coordinate properties --------------------- */
    results.push(target);
  }
  return results as Target[];
};

const getGroupObservations = (inValue: ObservationSetBackend[] | null) => {
  const results: any = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    if (inValue[i].group_id) {
      const observationSetId = inValue[i].observation_set_id;
      const observationId =
        observationSetId && observationSetId.trim() !== '' ? observationSetId : i + 1;
      results.push({
        observationId: observationId,
        groupId: inValue[i].group_id
      });
    }
  }
  return results;
};

const getDataProductSRC = (inValue: DataProductSRCNetBackend[] | null): DataProductSRC[] => {
  return inValue
    ? inValue.map((dp) => ({
        id: dp?.data_products_src_id,
        dataProductType: 0,
        observationId: ''
      }))
    : [];
};

// The image/visibilities split is carried on `variant`, not `kind` - `kind` is 'continuum' for
// both a continuum image and its hidden visibilities companion (see getDataProductScriptParameters
// in putProposalMapping.tsx), so switching on kind here could never actually match either of them.
const getDataProductType = (el: any) => {
  switch ((el.variant ?? '').toLowerCase()) {
    case 'visibilities':
      return DP_TYPE_VISIBLE;
    case 'detected filterbank':
      return DETECTED_FILTER_BANK_VALUE;
    case 'pulsar timing':
      return PULSAR_TIMING_VALUE;
    case 'flow through':
      return FLOW_THROUGH_VALUE;
    default:
      return DP_TYPE_IMAGES;
  }
};

const getDataProductSDP = (inValue: DataProductSDPsBackend[] | null): DataProductSDPNew[] => {
  const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];
  const PIXEL_SIZE_UNITS = ['deg', 'arcmin', 'arcsec', 'arcsecs'];

  const getImageSizeUnits = (unit: string | null): number =>
    unit ? IMAGE_SIZE_UNITS.indexOf(unit) : 0;

  const getPixelSizeUnits = (unit: string | null): number =>
    unit ? PIXEL_SIZE_UNITS.indexOf(unit) : 0;

  return (
    inValue?.map((dp) => {
      const script = dp?.script_parameters ?? {};
      return {
        id: dp?.data_product_id ?? '',
        observationId: dp?.observation_set_ref ?? '',
        data: {
          dataProductType: getDataProductType(script) ?? 0,
          imageSizeValue: 'image_size' in script ? (script.image_size?.value ?? 0) : 0,
          imageSizeUnits:
            'image_size' in script ? getImageSizeUnits(script.image_size?.unit ?? null) : 0,

          pixelSizeValue: 'image_cellsize' in script ? (script.image_cellsize?.value ?? 0) : 0,
          pixelSizeUnits:
            'image_cellsize' in script ? getPixelSizeUnits(script.image_cellsize?.unit ?? null) : 0,
          weighting:
            getWeighting('weight' in script ? script.weight?.weighting : undefined) ?? IW_BRIGGS,
          robust:
            'weight' in script && script.weight?.weighting === 'briggs'
              ? Number(script.weight.robust ?? ROBUST_DEFAULT)
              : ROBUST_DEFAULT,
          polarisations: 'polarisations' in script ? script.polarisations : undefined,
          channelsOut: 'channels_out' in script ? (Number(script.channels_out) ?? 0) : 0,
          taperValue: 'gaussian_taper' in script ? (Number(script.gaussian_taper) ?? 0) : 0,
          // TODO - we shouldn't need so many conditionals in this function. Fix when we have
          // refactored with better typing
          timeAveraging: script.time_averaging ?? 1,
          frequencyAveraging: script.frequency_averaging ?? 1,
          bitDepth: 'bit_depth' in script ? (Number(script.bit_depth) ?? 1) : 1,
          continuumSubtraction:
            'continuum_subtraction' in script ? Boolean(script.continuum_subtraction) : false,
          outputFrequencyResolution:
            'output_frequency_resolution' in script
              ? (Number(script.output_frequency_resolution) ?? 0)
              : 0,
          outputSamplingInterval:
            'output_sampling_interval' in script
              ? (Number(script.output_sampling_interval) ?? 0)
              : 0,
          dispersionMeasure:
            'dispersion_measure' in script ? (Number(script.dispersion_measure) ?? 0) : 0,
          rotationMeasure: 'rotation_measure' in script ? (Number(script.rotation_measure) ?? 0) : 0
        }
      };
    }) ?? []
  );
};

const getCalibrationStrategy = (
  inValue: CalibrationStrategyBackend[] | null
): CalibrationStrategy[] => {
  return inValue
    ? inValue.map((strategy) => ({
        observatoryDefined: strategy?.observatory_defined,
        id: strategy?.calibration_id,
        observationIdRef: strategy?.observation_set_ref,
        calibrators: strategy?.calibrators
          ? strategy?.calibrators?.map((calibrator) => calibratorMapping(calibrator))
          : null,
        notes: strategy.notes
      }))
    : [];
};

/*********************************************************** observation parameters mapping *********************************************************/
// Returns undefined for a missing label, or one the backend sends that we don't know, leaving the
// caller to apply the default.
const getWeighting = (inImageWeighting?: string): number | undefined =>
  IMAGE_WEIGHTING?.find((item) => item.label.toLowerCase() === inImageWeighting?.toLowerCase())
    ?.value;

const getSupplied = (inSupplied: SuppliedBackend | null): Supplied => {
  const suppliedType = OSD_CONSTANTS.Supplied?.find(
    (s) => s.mappingLabel === inSupplied?.supplied_type
  );
  const suppliedUnits =
    suppliedType?.units?.find((u) => u.label === inSupplied?.quantity.unit)?.value ??
    inSupplied?.supplied_type;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied?.quantity.value,
    units: suppliedUnits ? suppliedUnits : 1
  };
  return supplied as Supplied;
};

export const getFrequencyAndBandwidthUnits = (
  inUnits: string | null,
  observingBand: string
): number => {
  const units = FREQUENCY_UNITS.find(
    (item) => item.mapping.toLowerCase() === inUnits?.toLowerCase()
  )?.value;
  return units
    ? units
    : (FREQUENCY_UNITS.find(
        (item) =>
          item.label.toLowerCase() ===
          (observingBand === BAND_LOW_STR ? FREQUENCY_STR_GHZ : FREQUENCY_STR_MHZ).toLowerCase()
      )?.value as number);
};

export const getBandwidth = (incBandwidth: number, telescope: number): number => {
  const options = OSD_CONSTANTS.array?.find((item) => item?.value === telescope)?.bandWidth ?? [];
  if (options.length === 0) return 1;
  // Match by nearest numeric value rather than an exact substring of the label, since the
  // backend can round/reformat the stored number (e.g. 390.625 -> 390.63) - an exact string
  // match would silently fall through to the default and lose the saved selection.
  const closest = options.reduce((best, candidate) =>
    Math.abs(Number(candidate?.label?.split(' ')[0]) - incBandwidth) <
    Math.abs(Number(best?.label?.split(' ')[0]) - incBandwidth)
      ? candidate
      : best
  );
  return closest.value;
};

// This is here as there is inconsistent representation of spectral and spectral line.
const typeCheck = (inType: string | undefined): any => {
  if (inType === TYPE_ZOOM_LONG) return TYPE_ZOOM;
  if (inType === TYPE_CONTINUUM_SPECTRAL_LONG) return TYPE_CONTINUUM_SPECTRAL;
  return inType;
};

const getObservations = (inValue: ObservationSetBackend[] | null): Observation[] => {
  const results: Observation[] = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    const arr = inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING ? 1 : 2;
    //TODO: Rework logic to reference array label rather than number
    // Older observations may have been saved as 'aa2' before the LOW array assembly was
    // renamed to 'aa2_sv' - normalise so those still resolve to the current SA_AA2 entry.
    const backendSubarray = inValue[i]?.array_details?.subarray?.toLocaleLowerCase();
    const normalizedSubarray = backendSubarray === 'aa2' ? SA_AA2 : backendSubarray;
    const sub = OSD_CONSTANTS.array[arr - 1].subarray?.find(
      (p) => p.value.toLowerCase() === normalizedSubarray
    )?.value;

    const type = typeCheck(inValue[i]?.observation_type_details?.observation_type);

    const observingBand = inValue[i]?.observing_band;

    // MID array details
    let weather, num15mAntennas, num13mAntennas, numSubBands;
    if (inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING) {
      const midDetails = inValue[i].array_details as ArrayDetailsMidBackend;
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
    }

    // LOW array details
    let numStations;
    if (inValue[i]?.array_details?.array === TELESCOPE_LOW_BACKEND_MAPPING) {
      const lowDetails = inValue[i].array_details as ArrayDetailsLowBackend;
      numStations = lowDetails.number_of_stations;
    }

    const obs: Observation = {
      id: inValue[i].observation_set_id,
      telescope: arr,
      subarray: sub ? sub : '',
      type: String(type),
      observingBand: observingBand,
      weather: weather,
      centralFrequency: inValue[i]?.observation_type_details?.central_frequency?.value as number,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i]?.observation_type_details?.central_frequency?.unit ?? null,
        observingBand
      ),
      elevation: inValue[i]?.elevation as number,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands ? numSubBands : 1,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details?.bandwidth?.value ?? 0, arr)
          : null,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied ?? null),
      spectralResolution: String(
        (inValue[i].observation_type_details as ObservationTypeDetailsSpectralBackend)
          ?.spectral_resolution
      ),
      effectiveResolution: String(
        (inValue[i].observation_type_details as ObservationTypeDetailsSpectralBackend)
          ?.effective_resolution
      ),
      spectralAveraging: Number(
        (inValue[i].observation_type_details as ObservationTypeDetailsSpectralBackend)
          ?.spectral_averaging
      ),
      continuumBandwidth:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? (inValue[i].observation_type_details?.bandwidth?.value ?? null)
          : null,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? getFrequencyAndBandwidthUnits(
              inValue[i]?.observation_type_details?.bandwidth?.unit ?? null,
              observingBand
            )
          : null,
      numStations: numStations,
      ...(type === TYPE_ZOOM && {
        zoomChannels: Number(
          (inValue[i].observation_type_details as ObservationTypeDetailsSpectralBackend)
            ?.number_of_channels
        )
      }),
      ...(type === TYPE_PST && {
        pstMode: PST_MODES?.find(
          (mode) =>
            mode?.mapping ===
            (inValue[i].observation_type_details as ObservationTypeDetailsPSTBackend)?.pst_mode
        )?.value
      })
    };
    results.push(obs);
  }
  return results;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/

const getResultsSection1 = (
  inResult: ResultsDetailsBackend,
  isContinuum: boolean,
  isPST: boolean,
  isSensitivity: boolean,
  inObservationSets: ObservationSetBackend[],
  inResultObservationRef: string | null
): SensCalcResults['section1'] => {
  let section1 = [];
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);

  // for continuum or PST observation
  if (isContinuum || isPST) {
    if (!isSensitivity) {
      section1.push({
        // This is only saved for supplied sensitivity obs in backend
        // However, we do display continuumSensitivityWeighted, etc. for supplied integration in UI
        // TODO SC -> sens calcs results in UI need to be updated to have different fields for integration time results and sensitivity results
        // => see sensitivity calculator
        // TODO SC once sens calcs results updated, mapping of results will need updating to reflect different fields for different results
        field: 'continuumSensitivityWeighted',
        value: inResult.result?.weighted_continuum_sensitivity?.value.toString(),
        units: inResult?.result?.weighted_continuum_sensitivity?.unit?.split(' ')?.join('') // trim white spaces
      } as ResultsSection);
    }
    section1.push({
      field: 'continuumConfusionNoise',
      value: inResult.continuum_confusion_noise?.value.toString(),
      units: inResult?.continuum_confusion_noise?.unit?.split(' ')?.join('')
    } as ResultsSection);
    if (!isSensitivity) {
      section1.push({
        field: 'continuumTotalSensitivity',
        value: inResult.result?.total_continuum_sensitivity?.value.toString(),
        units: inResult?.result?.total_continuum_sensitivity?.unit?.split(' ')?.join('')
      } as ResultsSection);
    }
    section1.push({
      field: 'continuumSynthBeamSize',
      value: inResult.synthesized_beam_size?.continuum,
      units: inResult?.synthesized_beam_size?.unit
    } as ResultsSection);
    if (isSensitivity) {
      section1.push({
        field: 'continuumIntegrationTime',
        value: obs?.observation_type_details?.supplied?.quantity?.value.toString(),
        units: obs?.observation_type_details?.supplied?.quantity?.unit
      } as ResultsSection);
    } else {
      section1.push({
        field: 'continuumSurfaceBrightnessSensitivity',
        value: inResult.result?.surface_brightness_sensitivity?.continuum?.toString(),
        units: inResult?.result?.surface_brightness_sensitivity?.unit?.split(' ')?.join('')
      } as ResultsSection);
    }
    // for zoom observation
  } else {
    section1 = getResultsSection2(
      inResult,
      isSensitivity,
      inObservationSets,
      inResultObservationRef
    ) as any[];
  }
  return section1;
};

const getResultsSection2 = (
  inResult: ResultsDetailsBackend,
  isSensitivity: boolean,
  inObservationSets: ObservationSetBackend[],
  inResultObservationRef: string | null
): SensCalcResults['section2'] => {
  const section2 = [];
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);

  if (!isSensitivity) {
    section2.push({
      field: 'spectralSensitivityWeighted',
      value: inResult.result?.weighted_spectral_sensitivity?.value.toString(),
      units: inResult?.result?.weighted_spectral_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  section2.push({
    field: 'spectralConfusionNoise',
    value: inResult.spectral_confusion_noise?.value.toString(),
    units: inResult?.spectral_confusion_noise?.unit?.split(' ')?.join('')
  } as ResultsSection);
  if (!isSensitivity) {
    section2.push({
      field: 'spectralTotalSensitivity',
      value: inResult.result?.total_spectral_sensitivity?.value.toString(),
      units: inResult?.result?.total_spectral_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  section2.push({
    field: 'spectralSynthBeamSize',
    value: inResult.synthesized_beam_size?.spectral,
    units: inResult?.synthesized_beam_size?.unit // unit is the same for spectral or continuum
  } as ResultsSection);
  if (isSensitivity) {
    section2.push({
      field: 'spectralIntegrationTime',
      value: obs?.observation_type_details?.supplied?.quantity?.value.toString(),
      units: obs?.observation_type_details?.supplied?.quantity?.unit
    } as ResultsSection);
  } else {
    section2.push({
      field: 'spectralSurfaceBrightnessSensitivity',
      value: inResult.result?.surface_brightness_sensitivity?.spectral?.toString(),
      units: inResult?.result?.surface_brightness_sensitivity?.unit?.split(' ')?.join('')
    } as ResultsSection);
  }
  return section2;
};

const getResultsSection3 = (
  inResultObservationRef: string | null,
  inObservationSets: ObservationSetBackend[],
  _inResult: ResultsDetailsBackend,
  isSensitivity: boolean
): SensCalcResults['section3'] => {
  const obs = inObservationSets?.find((o) => o.observation_set_id === inResultObservationRef);
  const field = isSensitivity ? 'sensitivity' : 'integrationTime';
  return [
    {
      field: field,
      value: obs?.observation_type_details?.supplied?.quantity?.value?.toString() as string,
      units: obs?.observation_type_details?.supplied?.quantity?.unit?.split(' ')?.join('')
    }
  ];
};

const getResultObsType = (
  result: ResultsDetailsBackend,
  inObservationSets: ObservationSetBackend[]
) => {
  const obsSetRef = result.observation_set_ref;
  const obs = inObservationSets.find((item) => item.observation_set_id === obsSetRef);
  return obs?.observation_type_details?.observation_type;
};

const getTargetObservation = (
  inResults: ResultsDetailsBackend[] | null,
  inObservationSets: ObservationSetBackend[] | null,
  // inTargets: TargetBackend[],
  outTargets: Target[]
): TargetObservation[] => {
  const targetObsArray: TargetObservation[] = [];
  if (
    !inResults ||
    inResults.length === 0 ||
    !inObservationSets ||
    inObservationSets.length === 0
  ) {
    return targetObsArray;
  }
  for (const result of inResults) {
    const resultObsType = getResultObsType(result, inObservationSets);
    const isContinuum =
      resultObsType === TYPE_CONTINUUM || resultObsType === TYPE_CONTINUUM_SPECTRAL_LONG;
    const isPST = resultObsType === TYPE_PST;
    const isSensitivity = result.result?.supplied_type === 'sensitivity';

    const targetObs: TargetObservation = {
      targetId: result.target_ref,
      observationId: result.observation_set_ref,
      dataProductsSDPId: result?.data_product_ref
    };

    if (result.result != undefined) {
      targetObs.sensCalc = {
        title: result.target_ref as string,
        statusGUI: 0, // only for UI
        error: '', // only for UI
        section1: getResultsSection1(
          result,
          isContinuum,
          isPST,
          isSensitivity,
          inObservationSets,
          result.observation_set_ref
        ),
        section2:
          isContinuum || isPST
            ? getResultsSection2(
                result,
                isSensitivity,
                inObservationSets,
                result.observation_set_ref
              )
            : [], // only used for continuum & PST observation
        section3: getResultsSection3(
          result.observation_set_ref,
          inObservationSets,
          result,
          isSensitivity
        )
      };
    }

    targetObsArray.push(targetObs);
  }
  return targetObsArray;
};

/*************************************************************************************************************************/

export function mapping(inRec: ProposalBackend): Proposal {
  const isSV: boolean = inRec.proposal_info?.proposal_type?.main_type === SCIENCE_VERIFICATION;

  const sciencePDF: DocumentPDF = getPDF(
    inRec?.observation_info?.documents,
    PDF_NAME_PREFIXES.SCIENCE + inRec.prsl_id
  ) as unknown as DocumentPDF;
  const technicalPDF: DocumentPDF | undefined = isSV
    ? undefined
    : (getPDF(
        inRec?.observation_info?.documents,
        PDF_NAME_PREFIXES.TECHNICAL + inRec.prsl_id
      ) as unknown as DocumentPDF);

  const targets = getTargets(inRec.observation_info?.targets);

  const convertedProposal = {
    metadata: inRec.metadata,
    id: inRec.prsl_id,
    title: inRec.proposal_info?.title,
    proposalType: isSV
      ? SCIENCE_VERIFICATION_TYPE_ID
      : PROJECTS?.find((p) => p.mapping === inRec.proposal_info?.proposal_type?.main_type)?.id,
    proposalSubType: isSV
      ? []
      : inRec.proposal_info?.proposal_type?.attributes
        ? getAttributes(inRec.proposal_info?.proposal_type)
        : [],
    status: inRec.status,
    lastUpdated: inRec.metadata?.last_modified_on,
    lastUpdatedBy: inRec.metadata?.last_modified_by,
    createdOn: inRec.metadata?.created_on,
    createdBy: inRec.metadata?.created_by,
    version: inRec.metadata?.version,
    cycle: inRec.cycle,
    investigators: getInvestigators(inRec.proposal_info?.investigators),
    abstract: inRec.proposal_info?.abstract,
    scienceCategory: isSV
      ? getObservingMode((inRec.proposal_info?.science_category as string) || '')
      : getScienceCategory((inRec.proposal_info?.science_category as string) || ''),
    scienceSubCategory: [1], // Not used currently
    sciencePDF: sciencePDF,
    scienceLoadStatus: sciencePDF?.isUploadedPdf ? FileUploadStatus.OK : FileUploadStatus.INITIAL,
    targetOption: 1, // TODO check what to map to
    targets: targets,
    observations: getObservations(inRec.observation_info?.observation_sets),
    groupObservations: getGroupObservations(inRec.observation_info?.observation_sets),
    targetObservation: getTargetObservation(
      inRec.observation_info?.result_details,
      inRec.observation_info?.observation_sets,
      targets
    ),
    calibrationStrategy: getCalibrationStrategy(inRec.observation_info?.calibration_strategy),
    technicalPDF: isSV ? undefined : technicalPDF,
    technicalLoadStatus: isSV
      ? FileUploadStatus.INITIAL
      : technicalPDF
        ? FileUploadStatus.OK
        : FileUploadStatus.INITIAL,
    dataProductSDP: inRec?.observation_info?.data_product_sdps
      ? getDataProductSDP(inRec.observation_info?.data_product_sdps as DataProductSDPsBackend[])
      : [],
    dataProductSRC: getDataProductSRC(inRec.observation_info?.data_product_src_nets),
    pipeline: '' // TODO remove this property from type as not needed
  };
  return convertedProposal as Proposal;
}

export function GetMockProposal(): Proposal {
  return mapping(MockProposalBackend);
}

async function GetProposal(
  authAxiosClient: ReturnType<typeof useAxiosAuthClient>,
  id: string
): Promise<Proposal | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposal();
  }

  if (isCypress) {
    if (cypressSV) {
      return mapping(MockProposal[1]);
    } else {
      return mapping(MockProposal[0]);
    }
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${id}`;
    const result = await authAxiosClient.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`);
    if (!result || !result?.data) {
      return 'error.API_UNKNOWN_ERROR';
    }
    return mapping(result.data);
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return 'error.API_UNKNOWN_ERROR';
  }
}

export default GetProposal;
