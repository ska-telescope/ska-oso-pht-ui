import axios from 'axios';
import {
  AXIOS_CONFIG,
  Projects,
  SKA_PHT_API_URL,
  TEAM_STATUS_TYPE_OPTIONS,
  USE_LOCAL_DATA,
  GENERAL,
  OBSERVATION,
  OBSERVATION_TYPE_BACKEND,
  BANDWIDTH_TELESCOPE,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  DEFAULT_PI,
  VEL_TYPES,
  RA_TYPE_EQUATORIAL,
  RA_TYPE_GALACTIC,
  VEL_UNITS,
  TELESCOPE_MID_BACKEND_MAPPING
} from '../../../utils/constants';
import MockProposalBackend from './mockProposalBackend';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import Target, { TargetBackend } from '../../../utils/types/target';
import { ObservationSetBackend } from '../../../utils/types/observationSet';
import DataProductSDP, {
  DataProductSDPsBackend,
  DataProductSRC,
  DataProductSRCNetBackend
} from '../../../utils/types/dataProduct';
import { ArrayDetailsMidBackend } from 'utils/types/arrayDetails';
import Observation from '../../../utils/types/observation';
import {
  ResultsSection,
  SensCalcResults,
  SensCalcResultsBackend
} from '../../../utils/types/sensCalcResults';
import TargetObservation from '../../../utils/types/targetObservation';
import Supplied, { SuppliedBackend } from '../../../utils/types/supplied';

const getTeamMembers = (inValue: InvestigatorBackend[]) => {
  let members = [];
  for (let i = 0; i < inValue?.length; i++) {
    members.push({
      id: inValue[i].investigator_id,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      country: DEFAULT_PI.country, // TODO should we remove country as not in backend?
      email: inValue[i]?.email,
      affiliation: inValue[i].organization,
      phdThesis: inValue[i].for_phd,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      pi: inValue[i].principal_investigator
    });
  }
  return members;
};

const getScienceSubCategory = () => {
  // TODO change this if/when user can choose a science subcategory
  return 1;
};

const getSubType = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = Projects?.find(({ mapping }) => mapping === proposalType.main_type);
  const subProjects = proposalType.sub_type?.map(subType =>
    project.subProjects?.find(({ mapping }) => mapping === subType)
  );
  return subProjects?.filter(({ id }) => id)?.map(({ id }) => id);
};

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory?.find(
    cat => cat.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat ? cat : null;
};

const getPI = (investigators: InvestigatorBackend[]) => {
  return investigators?.find(item => item.principal_investigator === true).investigator_id;
};

const extractFileFromURL = (url): Promise<File> => {
  return fetch(url, { mode: 'no-cors' })
    .then(response => response.blob())
    .then(blob => {
      const file = new File([blob], 'myfile.pdf', { type: 'application/pdf' });
      return file;
    });
};

const getPDF = async (documents: DocumentBackend[], docType: string): Promise<DocumentPDF> => {
  const pdf = documents?.find(doc => doc.type === docType);
  if (!pdf || !pdf.link) {
    return null;
  }
  const file = (await extractFileFromURL(pdf.link)) as File;
  const pdfDoc: DocumentPDF = {
    documentId: pdf?.document_id,
    link: pdf?.link,
    file: file ? file : null
  };
  return pdfDoc as DocumentPDF;
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
      decUnit: e.reference_coordinate.unit[1],
      id: i + 1,
      name: e.target_id,
      latitude: '', // TODO add latitude when coming from the backend - no property to map to currently
      longitude: '', // TODO add longitude when coming from the backend - no property to map to currently
      ra: referenceCoordinate === 'equatorial' ? e.reference_coordinate.ra?.toString() : '',
      raUnit: e.reference_coordinate.unit[0],
      redshift: e.radial_velocity.redshift.toString(),
      referenceFrame:
        e.reference_coordinate.kind === 'equatorial' ? RA_TYPE_EQUATORIAL : RA_TYPE_GALACTIC,
      rcReferenceFrame: e.reference_coordinate.reference_frame,
      raReferenceFrame: e.radial_velocity.reference_frame,
      raDefinition: e.radial_velocity.definition, // TODO modify as definition not implemented in the front-end yet
      velType: getVelType(e.radial_velocity.definition), // TODO modify as definition not implemented in the front-end yet
      vel: e.radial_velocity.quantity?.value?.toString(),
      velUnit: VEL_UNITS.find(u => u.label === e.radial_velocity.quantity.unit.split(' ').join(''))
        ?.value,
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

const getSDPOptions = (options: string[]): boolean[] => {
  const optionResults = [];
  for (let i = 0; i < 5; i++) {
    const num = (i + 1).toString();
    optionResults[i] = options.includes(num) ? true : false;
  }
  return optionResults;
};

const getDataProductSDP = (inValue: DataProductSDPsBackend[]): DataProductSDP[] => {
  return inValue?.map((dp, index) => ({
    id: index + 1,
    dataProductsSDPId: dp.data_products_sdp_id,
    observatoryDataProduct: getSDPOptions(dp.options),
    observationId: dp.observation_set_refs,
    imageSizeValue: Number(dp.image_size),
    imageSizeUnits: '', // TODO check why units not in backend data model
    pixelSizeValue: Number(dp.pixel_size),
    pixelSizeUnits: '', // TODO check why units not in backend data model // use sens calc results beam size units
    weighting: Number(dp.weighting)
  }));
};

/*********************************************************** observation parameters mapping *********************************************************/

const getWeighting = inImageWeighting => {
  const weighting = OBSERVATION.ImageWeighting?.find(
    item => item.label.toLowerCase() === inImageWeighting?.toLowerCase()
  )?.value;
  return weighting ? weighting : 1; // fallback
};

const getObservingBand = (inObsBand: string, inObsArray: string): number => {
  const mid1ObsBand = BANDWIDTH_TELESCOPE?.find(item => item.label.includes('Band 1'))?.value;
  const lowObsBand = BANDWIDTH_TELESCOPE?.find(item => item.label.includes('Low Band'))?.value;
  switch (inObsBand) {
    case 'low_band':
      return lowObsBand;
    case 'mid_band_1':
      return mid1ObsBand;
    case 'mid_band_2':
      return BANDWIDTH_TELESCOPE?.find(item => item.label.includes('Band 2'))?.value;
    case 'mid_band_3':
      return BANDWIDTH_TELESCOPE?.find(item => item.label.includes('Band 5a'))?.value;
    case 'mid_band_4':
      return BANDWIDTH_TELESCOPE?.find(item => item.label.includes('Band 5b'))?.value;
    default:
      // fallback: send low band for low array and mid band 1 for mid array
      return inObsArray.includes('mid') ? mid1ObsBand : lowObsBand;
  }
};

const getSupplied = (inSupplied: SuppliedBackend): Supplied => {
  const typeLabel = inSupplied.type === 'sensitivity' ? 'Sensitivity' : 'Integration Time';
  const suppliedType = OBSERVATION.Supplied?.find(s => s.label === typeLabel);
  const supppliedUnits = suppliedType.units?.find(u => u.label === inSupplied.quantity.unit)?.value;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied.quantity.value,
    units: supppliedUnits ? supppliedUnits : 1 // fallback
  };
  return supplied;
};

const getFrequencyAndBandwidthUnits = (
  inUnits: string,
  telescope: number,
  observingBand: number
): number => {
  const array = OBSERVATION.array?.find(item => item?.value === telescope);
  let units = array.CentralFrequencyAndBandWidthUnits?.find(
    item => item.mapping.toLowerCase() === inUnits?.toLowerCase()
  )?.value;
  // if we don't find the matching units, use bandwidth units of the observing band as that should be correct
  return units
    ? units
    : array.CentralFrequencyAndBandWidthUnits?.find(
        item => item.label.toLowerCase() === BANDWIDTH_TELESCOPE[observingBand].units?.toLowerCase()
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

    let elevation, weather, num15mAntennas, num13mAntennas, numSubBands, tapering;
    if ('elevation' in inValue[i].array_details && 'weather' in inValue[i].array_details) {
      // TODO remove elevation from condition once ODA updated
      const midDetails = inValue[i].array_details as ArrayDetailsMidBackend;
      elevation = midDetails.elevation; // TODO change mapping to get it from ObservationSet root once ODA updated
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
      tapering = midDetails.tapering;
    }

    const obs: Observation = {
      id: inValue[i].observation_set_id,
      telescope: arr,
      subarray: sub ? sub : 0,
      type: type,
      imageWeighting: getWeighting(inValue[i].observation_type_details?.image_weighting),
      observingBand: observingBand,
      centralFrequency: inValue[i].observation_type_details?.central_frequency?.value,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i].observation_type_details?.central_frequency.unit,
        arr,
        observingBand
      ),
      elevation: elevation, // map it to root of observation even if undefined for now
      weather: weather,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands,
      tapering: tapering,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details.bandwidth?.value, arr)
          : undefined,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied),
      spectralResolution: inValue[i].observation_type_details?.spectral_resolution,
      effectiveResolution: inValue[i].observation_type_details?.effective_resolution,
      linked: getLinked(inValue[i], inResults),
      continuumBandwidth:
        type === TYPE_CONTINUUM ? inValue[i].observation_type_details.bandwidth?.value : undefined,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM
          ? getFrequencyAndBandwidthUnits(
              inValue[i].observation_type_details.bandwidth.unit,
              arr,
              observingBand
            )
          : undefined,
      details: inValue[i].details
    };
    results.push(obs);
  }
  return results;
};

/*********************************************************** sensitivity calculator results mapping *********************************************************/

const getResultsSection1 = (inResult: SensCalcResultsBackend): SensCalcResults['section1'] => {
  let section1 = [];
  // for continuum observation
  if (inResult.continuum_confusion_noise) {
    section1.push({
      field: 'continuumSensitivityWeighted',
      value: inResult.result_details.weighted_continuum_sensitivity?.value.toString(),
      units: inResult.result_details.weighted_continuum_sensitivity.unit.split(' ').join('') // trim white spaces
    } as ResultsSection);
    section1.push({
      field: 'continuumConfusionNoise',
      value: inResult.continuum_confusion_noise?.value.toString(),
      units: inResult.continuum_confusion_noise.unit.split(' ').join('')
    } as ResultsSection);
    section1.push({
      field: 'continuumTotalSensitivity',
      value: inResult.result_details.total_continuum_sensitivity?.value.toString(),
      units: inResult.result_details.total_continuum_sensitivity.unit.split(' ').join('')
    } as ResultsSection);
    section1.push({
      field: 'continuumSynthBeamSize',
      // value: inResult.synthesized_beam_size?.value,
      // units: inResult.synthesized_beam_size.unit
      // mock beam size for now as format enforced by backend not correct
      value: '190.0 x 171.3',
      units: 'arcsecs2'
    } as ResultsSection);
    section1.push({
      field: 'continuumSurfaceBrightnessSensitivity',
      value: inResult.result_details.surface_brightness_sensitivity.continuum.toString(),
      units: inResult.result_details.surface_brightness_sensitivity.unit.split(' ').join('')
    } as ResultsSection);
    // for zoom observation
  } else {
    section1 = getResultsSection2(inResult);
  }
  return section1;
};

const getResultsSection2 = (inResult: SensCalcResultsBackend): SensCalcResults['section2'] => {
  let section2 = [];
  section2.push({
    field: 'spectralSensitivityWeighted',
    value: inResult.result_details.weighted_spectral_sensitivity?.value.toString(),
    units: inResult.result_details.weighted_spectral_sensitivity.unit.split(' ').join('')
  });
  section2.push({
    field: 'spectralConfusionNoise',
    value: inResult.spectral_confusion_noise?.value.toString(),
    units: inResult.spectral_confusion_noise.unit.split(' ').join('')
  });
  section2.push({
    field: 'spectralTotalSensitivity',
    value: inResult.result_details.total_spectral_sensitivity?.value.toString(),
    units: inResult.result_details.total_spectral_sensitivity.unit.split(' ').join('')
  });
  section2.push({
    // value: inResult.synthesized_beam_size?.value,
    // units: inResult.synthesized_beam_size.unit
    // mock beam size for now as format enforced by backend not correct
    value: '190.0 x 171.3',
    units: 'arcsecs2'
  });
  section2.push({
    field: 'spectralSurfaceBrightnessSensitivity',
    value: inResult.result_details.surface_brightness_sensitivity.spectral.toString(),
    units: inResult.result_details.surface_brightness_sensitivity.unit.split(' ').join('')
  });
  return section2;
};

const getResultsSection3 = (
  inResultObservationRef: string,
  inObservationSets: ObservationSetBackend[]
): SensCalcResults['section3'] => {
  const obs = inObservationSets?.find(o => o.observation_set_id === inResultObservationRef);
  // TODO revisit mapping once integration time format from PDM merged
  const field =
    obs.observation_type_details.supplied.type === 'sensitivity'
      ? 'sensitivity'
      : 'integrationTime';
  return [
    {
      field: field,
      value: obs.observation_type_details.supplied.quantity?.value.toString(),
      units: obs.observation_type_details.supplied.quantity.unit.split(' ').join('')
    }
  ];
};

const getTargetObservation = (
  inResults: SensCalcResultsBackend[],
  inObservationSets: ObservationSetBackend[]
): TargetObservation[] => {
  let targetObsArray = [];
  for (let result of inResults) {
    const targetObs: TargetObservation = {
      targetId: result.target_ref,
      observationId: result.observation_set_ref,
      sensCalc: {
        id: inResults?.indexOf(result) + 1, // only for UI
        title: result.target_ref,
        statusGUI: 0, // only for UI
        error: '', // only for UI
        section1: getResultsSection1(result),
        section2: result?.continuum_confusion_noise ? getResultsSection2(result) : [], // only used for continuum observation
        section3: getResultsSection3(result.observation_set_ref, inObservationSets)
      }
    };
    targetObsArray.push(targetObs);
  }
  return targetObsArray;
};

/*************************************************************************************************************************/

function mapping(inRec: ProposalBackend): Proposal {
  let sciencePDF: DocumentPDF;
  getPDF(inRec?.info?.documents, 'proposal_science').then(pdf => {
    sciencePDF = pdf;
  });
  let technicalPDF: DocumentPDF;
  getPDF(inRec?.info?.documents, 'proposal_technical').then(pdf => {
    technicalPDF = pdf;
  });

  const convertedProposal = {
    id: inRec.prsl_id,
    title: inRec.info.title,
    proposalType: Projects?.find(p => p.mapping === inRec.info.proposal_type.main_type)?.id,
    proposalSubType: inRec.info.proposal_type.sub_type ? getSubType(inRec.info.proposal_type) : [],
    status: inRec.status,
    lastUpdated: inRec.metadata.last_modified_on,
    lastUpdatedBy: inRec.metadata.last_modified_by,
    createdOn: inRec.metadata.created_on,
    createdBy: inRec.metadata.created_by,
    version: inRec.metadata.version,
    cycle: inRec.cycle,
    team: getTeamMembers(inRec.info.investigators),
    pi: getPI(inRec.info.investigators),
    abstract: inRec.info.abstract,
    scienceCategory: getScienceCategory(inRec.info.science_category),
    scienceSubCategory: [getScienceSubCategory()],
    sciencePDF: sciencePDF,
    scienceLoadStatus: sciencePDF ? 1 : 0,
    targetOption: 1, // TODO check what to map to
    targets: getTargets(inRec.info.targets),
    observations: getObservations(inRec.info.observation_sets, inRec.info.results),
    groupObservations: getGroupObservations(inRec.info.observation_sets),
    targetObservation:
      inRec?.info?.results?.length > 1
        ? getTargetObservation(inRec.info.results, inRec.info.observation_sets)
        : [],
    technicalPDF: technicalPDF, // TODO sort doc link on ProposalDisplay
    technicalLoadStatus: technicalPDF ? 1 : 0,
    DataProductSDP: getDataProductSDP(inRec.info.data_product_sdps),
    DataProductSRC: getDataProductSRC(inRec.info.data_product_src_nets),
    pipeline: '' // TODO check if we can remove this or what should it be mapped to
  };
  return convertedProposal;
}

export function GetMockProposal(): Proposal {
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
