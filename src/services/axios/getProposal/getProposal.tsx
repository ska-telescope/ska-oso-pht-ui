import axios from 'axios';
import { FileUploadStatus } from '@ska-telescope/ska-gui-components';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from '../../../utils/types/arrayDetails';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import Target, { PointingPatternParams, TargetBackend } from '../../../utils/types/target';
import Observation from '../../../utils/types/observation';
import {
  ResultsSection,
  SensCalcResults,
  SensCalcResultsBackend
} from '../../../utils/types/sensCalcResults';
import TargetObservation from '../../../utils/types/targetObservation';
import Supplied, { SuppliedBackend } from '../../../utils/types/supplied';
import {
  AXIOS_CONFIG,
  PROJECTS,
  SKA_OSO_SERVICES_URL,
  USE_LOCAL_DATA,
  GENERAL,
  OBSERVATION,
  OBSERVATION_TYPE_BACKEND,
  BANDWIDTH_TELESCOPE,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  VEL_TYPES,
  RA_TYPE_EQUATORIAL,
  RA_TYPE_GALACTIC,
  VEL_UNITS,
  TELESCOPE_MID_BACKEND_MAPPING,
  TELESCOPE_LOW_BACKEND_MAPPING,
  IMAGE_WEIGHTING,
  BAND_LOW,
  BAND_1,
  FREQUENCY_UNITS,
  ROBUST,
  OSO_SERVICES_PROPOSAL_PATH,
  PDF_NAME_PREFIXES
} from '../../../utils/constants';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import { ObservationSetBackend } from '../../../utils/types/observationSet';
import { MockProposalBackend } from './mockProposalBackend';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '@/utils/types/dataProduct.tsx';
import TeamMember from '@/utils/types/teamMember';

const getTeamMembers = (inValue: InvestigatorBackend[] | null) => {
  let members = [] as TeamMember[];
  if (!inValue || inValue.length === 0) {
    return members;
  }
  for (let i = 0; i < inValue?.length; i++) {
    members.push({
      id: inValue[i].investigator_id,
      status: inValue[i].status,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      email: inValue[i]?.email,
      affiliation: inValue[i].organization as string,
      phdThesis: inValue[i].for_phd as boolean,
      pi: inValue[i].principal_investigator as boolean
    });
  }
  return members;
};

const getScienceSubCategory = () => {
  // TODO change this if/when user can choose a science subcategory
  return 1;
};

const getAttributes = (proposalType: { main_type: string; attributes?: string[] }): any => {
  const project = PROJECTS?.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.attributes?.map(attributes =>
    project?.subProjects?.find(({ mapping }) => mapping === attributes)
  ) as { id: number; label: string; mapping: string }[];
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
};

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory?.find(
    cat => cat.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
};

const getPDF = (documents: DocumentBackend[] | null, documentId: string): DocumentPDF | null => {
  if (!documents) return null;

  const documentById = documents.find(document => document.document_id === documentId);

  if (!documentById) return null;

  return {
    documentId: documentById.document_id,
    isUploadedPdf: documentById.uploaded_pdf
  };
};

const getVelType = (InDefinition: string) => {
  const velType = VEL_TYPES.find(item => item.label.toLowerCase() === InDefinition?.toLowerCase())
    ?.value;
  return velType ? velType : 1; // fallback
};

const getTargets = (inRec: TargetBackend[]): Target[] => {
  let results = [];
  for (let i = 0; i < inRec?.length; i++) {
    const e = inRec[i];
    const referenceCoordinate = e.reference_coordinate.kind;
    const target: Target = {
      dec: referenceCoordinate === 'equatorial' ? e.reference_coordinate.dec?.toString() : '',
      decUnit: e.reference_coordinate?.unit[1],
      id: i + 1, // TODO use e.target_id once it is a number => needs to be changed in ODA & PDM
      name: e?.target_id,
      latitude: '', // TODO add latitude when coming from the backend - no property to map to currently
      longitude: '', // TODO add longitude when coming from the backend - no property to map to currently
      ra: referenceCoordinate === 'equatorial' ? e.reference_coordinate.ra?.toString() : '',
      raUnit: e.reference_coordinate?.unit[0],
      redshift: e.radial_velocity.redshift.toString(),
      referenceFrame:
        e.reference_coordinate.kind === 'equatorial' ? RA_TYPE_EQUATORIAL : RA_TYPE_GALACTIC,
      rcReferenceFrame: e.reference_coordinate.reference_frame,
      raReferenceFrame: e.radial_velocity.reference_frame,
      raDefinition: e.radial_velocity.definition, // TODO modify as definition not implemented in the front-end yet
      velType: getVelType(e.radial_velocity.definition), // TODO modify as definition not implemented in the front-end yet
      vel: e.radial_velocity.quantity?.value?.toString(),
      velUnit: VEL_UNITS.find(
        u => u.label === e.radial_velocity?.quantity?.unit?.split(' ').join('')
      )?.value as number,
      pointingPattern: {
        active: e.pointing_pattern?.active as string,
        parameters: e.pointing_pattern?.parameters?.map(p => ({
          kind: p.kind,
          offsetXArcsec: p.offset_x_arcsec,
          offsetYArcsec: p.offset_y_arcsec
        })) as PointingPatternParams[]
      }
    };
    results.push(target);
  }
  return results;
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
  return inValue ? inValue.map(dp => ({ id: dp?.data_products_src_id })) : [];
};

const getSDPOptions = (options: string[]): boolean[] => options.map(element => element === 'Y');

const getDataProductSDP = (inValue: DataProductSDPsBackend[] | null): DataProductSDP[] => {
  const getImageSizeUnits = (inValue: string) => {
    const IMAGE_SIZE_UNITS = ['deg', 'arcmin', 'arcsec'];
    for (let i = 0; i < IMAGE_SIZE_UNITS.length; i++) {
      if (IMAGE_SIZE_UNITS[i] === inValue) {
        return i;
      }
    }
    return 0;
  };

  const getPixelSizeUnits = (inValue: string | null): any =>
    inValue === 'arcsec' ? 'arcsecs' : inValue || '';

  return inValue?.map((dp, index) => ({
    id: index + 1,
    dataProductsSDPId: dp.data_products_sdp_id,
    observatoryDataProduct: getSDPOptions(dp.options),
    observationId: dp.observation_set_refs,
    imageSizeValue: dp.image_size.value,
    imageSizeUnits: getImageSizeUnits(dp.image_size.unit),
    pixelSizeValue: dp.pixel_size?.value,
    pixelSizeUnits: dp?.pixel_size?.unit ? getPixelSizeUnits(dp?.pixel_size?.unit) : null,
    weighting: Number(dp.weighting)
  })) as DataProductSDP[];
};

/*********************************************************** observation parameters mapping *********************************************************/

const getWeighting = (inImageWeighting: string): number => {
  const weighting = IMAGE_WEIGHTING?.find(
    item => item.lookup.toLowerCase() === inImageWeighting?.toLowerCase()
  )?.value;
  return weighting ? weighting : 1; // fallback
};

const getObservingBand = (inObsBand: string | null, inObsArray: string | null): number => {
  const band = BANDWIDTH_TELESCOPE?.find(item => item.mapping === inObsBand)?.value;
  const fallback = inObsArray?.includes('low') ? BAND_LOW : BAND_1;
  return band ? band : fallback;
};

const getSupplied = (inSupplied: SuppliedBackend | null): Supplied => {
  const typeLabel =
    inSupplied?.supplied_type === 'sensitivity' ? 'Sensitivity' : 'Integration Time';
  const suppliedType = OBSERVATION.Supplied?.find(s => s.label === typeLabel);
  const suppliedUnits = suppliedType?.units?.find(u => u.label === inSupplied?.quantity.unit)
    ?.value;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied?.quantity.value,
    units: suppliedUnits ? suppliedUnits : 1 // fallback
  };
  return supplied as Supplied;
};

const getFrequencyAndBandwidthUnits = (
  inUnits: string | null,
  telescope: number,
  observingBand: number
): number => {
  let units = FREQUENCY_UNITS.find(item => item.mapping.toLowerCase() === inUnits?.toLowerCase())
    ?.value;
  return units
    ? units
    : (FREQUENCY_UNITS.find(
        item =>
          item.label.toLowerCase() === BANDWIDTH_TELESCOPE[observingBand]?.units?.toLowerCase()
      )?.value as number);
};

const getBandwidth = (incBandwidth: number, telescope: number): number => {
  const array = OBSERVATION.array?.find(item => item?.value === telescope);
  const bandwidth = array?.bandWidth?.find(bandwidth =>
    bandwidth?.label?.includes(String(incBandwidth?.toString()))
  )?.value;
  return bandwidth ? bandwidth : 1; // fallback
};

const getLinked = (
  inObservation: ObservationSetBackend,
  inResults: SensCalcResultsBackend[] | null
) => {
  const obsRef = inObservation.observation_set_id;
  const linkedTargetRef = inResults?.find(res => res?.observation_set_ref === obsRef)?.target_ref;
  return linkedTargetRef ? linkedTargetRef : '';
};

const getObservations = (
  inValue: ObservationSetBackend[] | null,
  inResults: SensCalcResultsBackend[] | null
): Observation[] => {
  const results: Observation[] = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    const arr = inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray?.find(
      p => p.label.toLowerCase() === inValue[i]?.array_details?.subarray?.toLocaleLowerCase()
    )?.value;
    const type =
      inValue[i]?.observation_type_details?.observation_type?.toLocaleLowerCase() ===
      OBSERVATION_TYPE_BACKEND[0]?.toLowerCase()
        ? 0
        : 1;
    const observingBand = getObservingBand(
      inValue[i]?.observing_band,
      inValue[i]?.array_details?.array
    );

    // MID array details
    let weather, num15mAntennas, num13mAntennas, numSubBands, tapering;
    if (inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING) {
      const midDetails = inValue[i].array_details as ArrayDetailsMidBackend;
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
      tapering = midDetails.tapering;
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
      subarray: sub ? sub : 0,
      type: type,
      imageWeighting: getWeighting(inValue[i].observation_type_details?.image_weighting),
      observingBand: observingBand,
      weather: weather,
      centralFrequency: inValue[i]?.observation_type_details?.central_frequency?.value as number,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i]?.observation_type_details?.central_frequency?.unit,
        arr,
        observingBand
      ),
      elevation: inValue[i]?.elevation as number,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands ? numSubBands : 1, // TODO PDM needs to be updated to allow subbands for LOW
      // so that we don't need to hardcode it
      tapering: (tapering as unknown) as number,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details?.bandwidth?.value, arr)
          : null,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied),
      robust: (ROBUST.find(item => item.label === inValue[i].observation_type_details?.robust)
        ?.value as unknown) as number,
      spectralResolution: inValue[i].observation_type_details?.spectral_resolution as string,
      effectiveResolution: inValue[i].observation_type_details?.effective_resolution as string,
      spectralAveraging: Number(inValue[i].observation_type_details?.spectral_averaging),
      linked: getLinked(inValue[i], inResults),
      continuumBandwidth:
        type === TYPE_CONTINUUM ? inValue[i].observation_type_details?.bandwidth?.value : null,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM
          ? getFrequencyAndBandwidthUnits(
              inValue[i]?.observation_type_details?.bandwidth?.unit,
              arr,
              observingBand
            )
          : null,
      numStations: numStations
    };
    results.push(obs);
  }
  return results;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/

const getResultsSection1 = (
  inResult: SensCalcResultsBackend,
  isContinuum: boolean,
  isSensitivity: boolean,
  inObservationSets: ObservationSetBackend[],
  inResultObservationRef: string | null
): SensCalcResults['section1'] => {
  let section1 = [];
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);

  // for continuum observation
  // if (inResult.continuum_confusion_noise) {
  if (isContinuum) {
    if (!isSensitivity) {
      section1.push({
        // This is only saved for supplied sensitivity obs in backend
        // However, we do display continuumSensitivityWeighted, etc. for supplied integration in UI
        // TODO -> sens calcs results in UI need to be updated to have different fields for integration time results and sensitivity results
        // => see sensitivity calculator
        // TODO once sens calcs results updated, mapping of results will need updating to reflect different fields for different results
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
  inResult: SensCalcResultsBackend,
  isSensitivity: Boolean,
  inObservationSets: ObservationSetBackend[],
  inResultObservationRef: string | null
): SensCalcResults['section2'] => {
  let section2 = [];
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);

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
  inResult: SensCalcResultsBackend,
  isSensitivity: boolean
): SensCalcResults['section3'] => {
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);
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
  result: SensCalcResultsBackend,
  inObservationSets: ObservationSetBackend[]
) => {
  const obsSetRef = result.observation_set_ref;
  const obs = inObservationSets.find(item => item.observation_set_id === obsSetRef);
  return obs?.observation_type_details?.observation_type;
};

const getTargetObservation = (
  inResults: SensCalcResultsBackend[] | null,
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
  for (let result of inResults) {
    const resultObsType = getResultObsType(result, inObservationSets);
    const isContinuum = resultObsType === OBSERVATION_TYPE_BACKEND[1].toLowerCase();
    const isSensitivity = result.result?.supplied_type === 'sensitivity';

    const targetObs: TargetObservation = {
      // TODO for targetId, use result.target_ref once it is a number => needs to be changed in ODA & PDM
      targetId: outTargets.find(tar => tar.name === result.target_ref)?.id as number,
      observationId: result.observation_set_ref as string,
      sensCalc: {
        id: inResults?.indexOf(result) + 1, // only for UI
        title: result.target_ref as string,
        statusGUI: 0, // only for UI
        error: '', // only for UI
        section1: getResultsSection1(
          result,
          isContinuum,
          isSensitivity,
          inObservationSets,
          result.observation_set_ref
        ),
        section2: isContinuum
          ? getResultsSection2(result, isSensitivity, inObservationSets, result.observation_set_ref)
          : [], // only used for continuum observation
        section3: getResultsSection3(
          result.observation_set_ref,
          inObservationSets,
          result,
          isSensitivity
        )
      }
    };
    targetObsArray.push(targetObs);
  }
  return targetObsArray;
};

/*************************************************************************************************************************/

export function mapping(inRec: ProposalBackend): Proposal {
  let sciencePDF: DocumentPDF;
  let technicalPDF: DocumentPDF;

  sciencePDF = (getPDF(
    inRec?.info?.documents,
    PDF_NAME_PREFIXES.SCIENCE + inRec.prsl_id
  ) as unknown) as DocumentPDF;
  technicalPDF = (getPDF(
    inRec?.info?.documents,
    PDF_NAME_PREFIXES.TECHNICAL + inRec.prsl_id
  ) as unknown) as DocumentPDF;

  const targets = getTargets(inRec.info.targets);

  const convertedProposal = {
    id: inRec.prsl_id,
    title: inRec.info.title,
    proposalType: PROJECTS?.find(p => p.mapping === inRec.info.proposal_type.main_type)?.id,
    proposalSubType: inRec.info.proposal_type.attributes
      ? getAttributes(inRec.info.proposal_type)
      : [],
    status: inRec.status,
    lastUpdated: inRec.metadata?.last_modified_on,
    lastUpdatedBy: inRec.metadata?.last_modified_by,
    createdOn: inRec.metadata?.created_on,
    createdBy: inRec.metadata?.created_by,
    version: inRec.metadata?.version,
    cycle: inRec.cycle,
    team: getTeamMembers(inRec.info.investigators),
    abstract: inRec.info.abstract,
    scienceCategory: getScienceCategory(inRec.info.science_category),
    scienceSubCategory: [getScienceSubCategory()],
    sciencePDF: sciencePDF,
    scienceLoadStatus: sciencePDF?.isUploadedPdf ? FileUploadStatus.OK : FileUploadStatus.INITIAL, //TODO align loadStatus to UploadButton status
    targetOption: 1, // TODO check what to map to
    targets: targets,
    observations: getObservations(inRec.info.observation_sets, inRec.info.result_details),
    groupObservations: getGroupObservations(inRec.info.observation_sets),
    targetObservation:
      inRec?.info?.result_details && inRec.info.result_details.length > 0
        ? getTargetObservation(
            inRec.info.result_details,
            inRec.info.observation_sets,
            // inRec.info.targets,
            targets
          )
        : [],
    technicalPDF: technicalPDF, // TODO sort doc link on ProposalDisplay
    technicalLoadStatus: technicalPDF ? FileUploadStatus.OK : FileUploadStatus.INITIAL, //TODO align loadStatus to UploadButton status
    dataProductSDP: getDataProductSDP(inRec.info.data_product_sdps),
    dataProductSRC: getDataProductSRC(inRec.info.data_product_src_nets),
    pipeline: '' // TODO check if we can remove this or what should it be mapped to
  };

  return convertedProposal as Proposal;
}

export function GetMockProposal(): Proposal {
  return mapping(MockProposalBackend);
}

async function GetProposal(id: string): Promise<Proposal | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposal();
  }

  try {
    const URL_PATH = `${OSO_SERVICES_PROPOSAL_PATH}/${id}`;
    const result = await axios.get(`${SKA_OSO_SERVICES_URL}${URL_PATH}`, AXIOS_CONFIG);
    if (!result?.data) {
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
