import axios from 'axios';
import {
  AXIOS_CONFIG,
  PROJECTS,
  SKA_PHT_API_URL,
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
  FREQUENCY_UNITS
} from '../../../utils/constants';
import MockProposalBackend from './mockProposalBackend';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import Target, { TargetBackend } from '../../../utils/types/target';
import { ObservationSetBackend } from '../../../utils/types/observationSet';
import {
  DataProductSDP,
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '../../../utils/types/dataProduct';
import { ArrayDetailsLowBackend, ArrayDetailsMidBackend } from 'utils/types/arrayDetails';
import Observation from '../../../utils/types/observation';
import {
  ResultsSection,
  SensCalcResults,
  SensCalcResultsBackend
} from '../../../utils/types/sensCalcResults';
import TargetObservation from '../../../utils/types/targetObservation';
import Supplied, { SuppliedBackend } from '../../../utils/types/supplied';
import { FileUploadStatus } from '@ska-telescope/ska-gui-components';

const getTeamMembers = (inValue: InvestigatorBackend[]) => {
  let members = [];
  for (let i = 0; i < inValue?.length; i++) {
    members.push({
      id: inValue[i].investigator_id,
      status: inValue[i].status,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      email: inValue[i]?.email,
      affiliation: inValue[i].organization,
      phdThesis: inValue[i].for_phd,
      pi: inValue[i].principal_investigator
    });
  }
  return members;
};

const getScienceSubCategory = () => {
  // TODO change this if/when user can choose a science subcategory
  return 1;
};

const getAttributes = (proposalType: { main_type: string; attributes: string[] }): any => {
  const project = PROJECTS?.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.attributes?.map(attributes =>
    project.subProjects?.find(({ mapping }) => mapping === attributes)
  );
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
};

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory?.find(
    cat => cat.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
};

const getPDF = (documents: DocumentBackend[], documentId: string): DocumentPDF => {
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
      )?.value,
      pointingPattern: {
        active: e.pointing_pattern.active,
        parameters: e.pointing_pattern.parameters?.map(p => ({
          kind: p.kind,
          offsetXArcsec: p.offset_x_arcsec,
          offsetYArcsec: p.offset_y_arcsec
        }))
      }
    };
    results.push(target);
  }
  return results;
};

const getGroupObservations = (inValue: ObservationSetBackend[]) => {
  let results = [];
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

const getDataProductSRC = (inValue: DataProductSRCNetBackend[]): DataProductSRC[] => {
  return inValue?.map(dp => ({ id: dp?.data_products_src_id }));
};

const getSDPOptions = (options: string[]): boolean[] => options.map(element => element === 'Y');

// TODO: remove after testing star-670
// const getFromArray = (inArray: string, occ: number) => inArray.split(' ')[occ];

const getDataProductSDP = (inValue: DataProductSDPsBackend[]): DataProductSDP[] => {
  return inValue?.map((dp, index) => ({
    id: index + 1,
    dataProductsSDPId: dp.data_products_sdp_id,
    observatoryDataProduct: getSDPOptions(dp.options),
    observationId: dp.observation_set_refs,
    // imageSizeValue: Number(getFromArray(dp.image_size, 0)),
    // imageSizeUnits: getFromArray(dp.image_size, 1),
    // pixelSizeValue: Number(getFromArray(dp.pixel_size, 0)),
    // pixelSizeUnits: getFromArray(dp.pixel_size, 1),
    imageSizeValue: dp.image_size.value,
    imageSizeUnits: dp.image_size.unit,
    pixelSizeValue: dp.pixel_size.value,
    pixelSizeUnits: dp.pixel_size.unit,
    weighting: Number(dp.weighting)
  }));
};

/*********************************************************** observation parameters mapping *********************************************************/

const getWeighting = inImageWeighting => {
  const weighting = IMAGE_WEIGHTING?.find(
    item => item.lookup.toLowerCase() === inImageWeighting?.toLowerCase()
  )?.value;
  return weighting ? weighting : 1; // fallback
};

const getObservingBand = (inObsBand: string, inObsArray: string): number => {
  const band = BANDWIDTH_TELESCOPE?.find(item => item.mapping === inObsBand)?.value;
  const fallback = inObsArray.includes('low') ? BAND_LOW : BAND_1;
  return band ? band : fallback;
};

const getSupplied = (inSupplied: SuppliedBackend): Supplied => {
  const typeLabel = inSupplied.supplied_type === 'sensitivity' ? 'Sensitivity' : 'Integration Time';
  const suppliedType = OBSERVATION.Supplied?.find(s => s.label === typeLabel);
  const suppliedUnits = suppliedType.units?.find(u => u.label === inSupplied.quantity.unit)?.value;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied.quantity.value,
    units: suppliedUnits ? suppliedUnits : 1 // fallback
  };
  return supplied;
};

const getFrequencyAndBandwidthUnits = (
  inUnits: string,
  telescope: number,
  observingBand: number
): number => {
  let units = FREQUENCY_UNITS.find(item => item.mapping.toLowerCase() === inUnits?.toLowerCase())
    ?.value;
  return units
    ? units
    : FREQUENCY_UNITS.find(
        item =>
          item.label.toLowerCase() === BANDWIDTH_TELESCOPE[observingBand]?.units?.toLowerCase()
      )?.value;
};

const getBandwidth = (incBandwidth: number, telescope: number): number => {
  const array = OBSERVATION.array?.find(item => item?.value === telescope);
  const bandwidth = array.bandWidth?.find(bandwidth =>
    bandwidth.label.includes(incBandwidth.toString())
  )?.value;
  return bandwidth ? bandwidth : 1; // fallback
};

const getLinked = (inObservation: ObservationSetBackend, inResults: SensCalcResultsBackend[]) => {
  const obsRef = inObservation.observation_set_id;
  const linkedTargetRef = inResults?.find(res => res?.observation_set_ref === obsRef)?.target_ref;
  return linkedTargetRef ? linkedTargetRef : '';
};

const getObservations = (
  inValue: ObservationSetBackend[],
  inResults: SensCalcResultsBackend[]
): Observation[] => {
  let results = [];
  for (let i = 0; i < inValue?.length; i++) {
    const arr = inValue[i].array_details.array === TELESCOPE_MID_BACKEND_MAPPING ? 1 : 2;
    const sub = OBSERVATION.array[arr - 1].subarray?.find(
      p => p.label.toLowerCase() === inValue[i].array_details.subarray?.toLocaleLowerCase()
    )?.value;
    const type =
      inValue[i].observation_type_details?.observation_type.toLocaleLowerCase() ===
      OBSERVATION_TYPE_BACKEND[0]?.toLowerCase()
        ? 0
        : 1;
    const observingBand = getObservingBand(
      inValue[i].observing_band,
      inValue[i].array_details.array
    );

    // MID array details
    let weather, num15mAntennas, num13mAntennas, numSubBands, tapering;
    if (inValue[i].array_details.array === TELESCOPE_MID_BACKEND_MAPPING) {
      const midDetails = inValue[i].array_details as ArrayDetailsMidBackend;
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
      tapering = midDetails.tapering;
    }

    // LOW array details
    let numStations;
    if (inValue[i].array_details.array === TELESCOPE_LOW_BACKEND_MAPPING) {
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
      centralFrequency: inValue[i].observation_type_details?.central_frequency?.value,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i]?.observation_type_details?.central_frequency?.unit,
        arr,
        observingBand
      ),
      elevation: inValue[i].elevation,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands ? numSubBands : 1, // TODO PDM needs to be updated to allow subbands for LOW
      // so that we don't need to hardcode it
      tapering: tapering,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details.bandwidth?.value, arr)
          : undefined,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied),
      robust: 0, // TODO
      spectralResolution: inValue[i].observation_type_details?.spectral_resolution,
      effectiveResolution: inValue[i].observation_type_details?.effective_resolution,
      spectralAveraging: Number(inValue[i].array_details?.spectral_averaging),
      linked: getLinked(inValue[i], inResults),
      continuumBandwidth:
        type === TYPE_CONTINUUM ? inValue[i].observation_type_details.bandwidth?.value : undefined,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM
          ? getFrequencyAndBandwidthUnits(
              inValue[i]?.observation_type_details?.bandwidth?.unit,
              arr,
              observingBand
            )
          : undefined,
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
  inResultObservationRef: string
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
        value: inResult.result.weighted_continuum_sensitivity?.value.toString(),
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
        value: inResult.result.total_continuum_sensitivity?.value.toString(),
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
        // // STAR-670 clarified to search from observation_type_details
        // value: '999', // TODO : Need to store and retrieve correct value
        // units: 's' // TODO : Need to store and retrieve correct units

        // STAR-670 clarified to search from observation_type_details and the checking is already there
        value: obs.observation_type_details.supplied?.quantity?.value.toString(),
        units: obs.observation_type_details.supplied?.quantity?.unit
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
    );
  }
  return section1;
};

const getResultsSection2 = (
  inResult: SensCalcResultsBackend,
  isSensitivity: Boolean,
  inObservationSets: ObservationSetBackend[],
  inResultObservationRef: string
): SensCalcResults['section2'] => {
  let section2 = [];
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);

  if (!isSensitivity) {
    section2.push({
      field: 'spectralSensitivityWeighted',
      value: inResult.result.weighted_spectral_sensitivity?.value.toString(),
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
      value: inResult.result.total_spectral_sensitivity?.value.toString(),
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
      //STAR-670 get from observation detail
      // value: '999', // TODO : Need to store and retrieve correct value
      // units: 's' // TODO : Need to store and retrieve correct units

      value: obs.observation_type_details.supplied?.quantity?.value.toString(),
      units: obs.observation_type_details.supplied?.quantity?.unit
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
  inResultObservationRef: string,
  inObservationSets: ObservationSetBackend[],
  inResult: SensCalcResultsBackend,
  isSensitivity: boolean
): SensCalcResults['section3'] => {
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);
  // TODO revisit mapping once integration time format from PDM merged
  const field = isSensitivity
    ? /*
      ? 'sensitivity'
      : 'integrationTime';
    */
      'integrationTime'
    : 'sensitivity';
  // TODO un-swap as above once PDM updated to use integration time for supplied sensitivity
  // and sensitivity for supplied integration time for RESULTS
  return [
    {
      field: field,
      value: obs.observation_type_details.supplied.quantity?.value.toString(),
      units: obs.observation_type_details?.supplied?.quantity?.unit?.split(' ')?.join('')
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
  inResults: SensCalcResultsBackend[],
  inObservationSets: ObservationSetBackend[],
  // inTargets: TargetBackend[],
  outTargets: Target[]
): TargetObservation[] => {
  let targetObsArray = [];
  for (let result of inResults) {
    const resultObsType = getResultObsType(result, inObservationSets);
    const isContinuum = resultObsType === OBSERVATION_TYPE_BACKEND[1].toLowerCase();
    // const isSensitivity = result.result.supplied_type === 'integration_time';
    const isSensitivity = result.result.supplied_type === 'sensitivity';

    const targetObs: TargetObservation = {
      // TODO for targetId, use result.target_ref once it is a number => needs to be changed in ODA & PDM
      targetId: outTargets.find(tar => tar.name === result.target_ref)?.id,
      observationId: result.observation_set_ref,
      sensCalc: {
        id: inResults?.indexOf(result) + 1, // only for UI
        title: result.target_ref,
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

function mapping(inRec: ProposalBackend): Proposal {
  console.log('getProposal mapping inRec', inRec);

  let sciencePDF: DocumentPDF;
  let technicalPDF: DocumentPDF;

  sciencePDF = getPDF(inRec?.info?.documents, 'science-doc-' + inRec.prsl_id);
  technicalPDF = getPDF(inRec?.info?.documents, 'technical-doc-' + inRec.prsl_id);

  const targets = getTargets(inRec.info.targets);

  const convertedProposal = {
    id: inRec.prsl_id,
    title: inRec.info.title,
    proposalType: PROJECTS?.find(p => p.mapping === inRec.info.proposal_type.main_type)?.id,
    proposalSubType: inRec.info.proposal_type.attributes
      ? getAttributes(inRec.info.proposal_type)
      : [],
    status: inRec.status,
    lastUpdated: inRec.metadata.last_modified_on,
    lastUpdatedBy: inRec.metadata.last_modified_by,
    createdOn: inRec.metadata.created_on,
    createdBy: inRec.metadata.created_by,
    version: inRec.metadata.version,
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
      inRec?.info?.result_details?.length > 0
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
  console.log('getProposal mapping convertedProposal', convertedProposal);
  return convertedProposal;
}

export async function GetMockProposal(): Promise<Proposal> {
  return mapping(MockProposalBackend);
}

async function GetProposal(id: string): Promise<Proposal | string> {
  if (USE_LOCAL_DATA) {
    return GetMockProposal();
  }

  try {
    const URL_PATH = `/proposals/${id}`;
    const result = await axios.get(`${SKA_PHT_API_URL}${URL_PATH}`, AXIOS_CONFIG);
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : mapping(result.data);
  } catch (e) {
    return e.message;
  }
}

export default GetProposal;
