/*
TODO:
- test getProposal mapping with data and map all new properties
- check if there are new properties to include in the frontend types?
- tidy up and remove all old mapping functions in this file
*/

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
  BANDWIDTH_TELESCOPE
} from '../../../utils/constants';
import MockProposalBackend from './mockProposalBackend';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { InvestigatorBackend } from '../../../utils/types/investigator';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import Target, { TargetBackend } from '../../../utils/types/target';
import { ObservationSetBackend } from '../../../utils/types/observationSet';
import { DataProductSDP, DataProductSDPsBackend, DataProductSRC, DataProductSRCNetBackend } from '../../../utils/types/dataProduct';
import { ArrayDetailsMidBackend } from 'utils/types/arrayDetails';
import Observation from 'utils/types/observation';

const getTeamMembers = (inValue: InvestigatorBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
    results.push({
      id: i + 1,
      firstName: inValue[i].given_name,
      lastName: inValue[i].family_name,
      email: inValue[i]?.email,
      affiliation: inValue[i].organization,
      phdThesis: inValue[i].for_phd,
      status: TEAM_STATUS_TYPE_OPTIONS.accepted,
      pi: inValue[i].principal_investigator
    });
  }
  return results;
};

const getScienceSubCategory = () => {
  // TODO change this if/when user can choose a science subcategory
  return 1;
};

/*
const getIntegrationTimeUnits = (inValue: String) => {
  const unitsList = OBSERVATION.Supplied.find(s => s.label === 'Integration Time')?.units;
  return unitsList.find(u => u.label === inValue)?.value;
};
*/

/* // old mapping - keeping it here for a bit during the transition
function mapping(inRec: ProposalBackend): Proposal {
  return {
    id: inRec.prsl_id,
    title: inRec.proposal_info.title,
    proposalType: getProposalType(inRec.proposal_info.proposal_type),
    proposalSubType: [getProposalSubTypeType(inRec.proposal_info.proposal_type)],
    team: getTeamMembers(inRec.proposal_info.investigators),
    abstract: inRec.proposal_info.abstract,
    category: getCategory(inRec.proposal_info.science_category),
    subCategory: [getSubCategory()],
    sciencePDF: null,
    scienceLoadStatus: 0,
    targetOption: 1,
    targets: getTargets(inRec.proposal_info.targets),
    observations: getObservations(inRec.proposal_info.science_programmes),
    groupObservations: getGroupObservations(inRec.proposal_info.science_programmes),
    targetObservation: [],
    technicalPDF: null,
    technicalLoadStatus: 0,
    dataProducts: [],
    pipeline: ''
  };
}
*/

const convertTypeFormat = (_inValue: string): string => {
  const words = _inValue.split('_');
  const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
  const formattedString = capitalizedWords.join(' ');
  return formattedString;
};

const getSubType = (proposalType: { main_type: string; sub_type: string[] }): any => {
  const project = Projects.find(({ title }) => title === convertTypeFormat(proposalType.main_type));
  const subTypesFormatted = [];
  for (let subtype of proposalType.sub_type) {
    subTypesFormatted.push(convertTypeFormat(subtype));
  }
  const subProjects = subTypesFormatted.map(subType =>
    project.subProjects.find(({ title }) => title.toLowerCase() === subType.toLowerCase())
  );
  return subProjects.filter(({ id }) => id).map(({ id }) => id);
};

const getScienceCategory = (scienceCat: string) => {
  const cat = GENERAL.ScienceCategory.find(
    cat => cat.label.toLowerCase() === scienceCat.toLowerCase()
  ).value;
  return cat ? cat : null;
};

const getPI = (investigators: InvestigatorBackend[]) => {
  return investigators.find(item => item.principal_investigator === true).investigator_id;
};

const getPDF = (documents: DocumentBackend[], docType: string): DocumentPDF => {
  const pdf = documents.find(doc => doc.type === docType);
  const pdfDoc = {
    documentId: pdf?.document_id,
    link: pdf?.link
  };
  return pdf ? pdfDoc : null;
}

const getTargets = (inRec: TargetBackend[]): Target[] => {
  let results = [];
  for (let i = 0; i < inRec.length; i++) {
    const e = inRec[i];
    const referenceCoordinate = e.reference_coordinate.kind;
      const target: Target = {
      /*
      // old mapping for reference
      dec: e.reference_coordinate.dec?.toString(),
      decUnits: e.reference_coordinate.unit,
      id: e.target_id !== '' ? e.target_id : i + 1,
      name: e.reference_coordinate.kind, // TODO: check this is correct
      ra: e.reference_coordinate.ra?.toString(),
      raUnits: e.reference_coordinate.unit,
      referenceFrame: e.reference_coordinate.reference_frame,
      vel: e.radial_velocity.quantity.value?.toString(),
      velUnits: e.radial_velocity.quantity.unit,
      */
      dec: referenceCoordinate === 'equatorial' ? e.reference_coordinate.dec?.toString() : '',
      decUnit: e.reference_coordinate.unit[0],
      id: i + 1,
      name: e.target_id,
      latitude: '', // TODO add latitude when coming from the backend - no property to map to currently
      longitude: '', // TODO add longitude when coming from the backend - no property to map to currently
      ra: referenceCoordinate === 'equatorial' ? e.reference_coordinate.ra?.toString() : '',
      raUnit: e.reference_coordinate.unit[0],
      redshift: e.radial_velocity.redshift.toString(),
      referenceFrame: e.reference_coordinate.kind,
      rcReferenceFrame: e.reference_coordinate.reference_frame,
      raReferenceFrame: e.radial_velocity.reference_frame,
      raDefinition: e.radial_velocity.definition,
      velType: e.radial_velocity.definition,
      vel: e.radial_velocity.quantity.value?.toString(),
      velUnit: e.radial_velocity.quantity.unit.split(' ').join(''), // removes white spaces in "m / s"
      pointingPattern: {
        active: e.pointing_pattern.active,
        parameters: e.pointing_pattern.parameters.map(p => ({
          kind: p.kind,
          offsetXArcsec: p.offset_x_arcsec,
          offsetYArcsec: p.offset_y_arcsec
        }))
      },
    };
    results.push(target);
  }
  return results;
};

const getGroupObservations = (inValue: ObservationSetBackend[]) => {
  let results = [];
  for (let i = 0; i < inValue.length; i++) {
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
  return inValue.map(dp => (
    { id: dp.data_products_src_id }
  ));
};

const getSDPOptions = (options: string[]): boolean[] => {
    const optionResults = [];
    for (let i = 0; i < 5; i++) {
      const num = (i + 1).toString();
      optionResults[i] = options.includes(num) ? true : false;
    }
  return optionResults;
}

const getDataProductSDP = (inValue: DataProductSDPsBackend[]): DataProductSDP[] => {
  return inValue.map((dp, index) => (
    { 
      id: index + 1, // TODO check if index ok or if we should extract the number in data_products_sdp_id
      dataProductsSDPId: dp.data_products_sdp_id,
      observatoryDataProduct: getSDPOptions(dp.options),
      observationId: dp.observation_set_refs,
      imageSizeValue: dp.image_size, // TODO seprate units from value
      imageSizeUnits: dp.image_size, // TODO seprate units from value
      pixelSizeValue: dp.pixel_size, // TODO seprate units from value
      pixelSizeUnits: dp.pixel_size, // TODO seprate units from value
      weighting: dp.weighting
    }
  ));
};


const getObservations = (inValue: ObservationSetBackend[]): Observation[] => {

  const getWeighting = (inImageWeighting) => {
    return inImageWeighting === 'DUMMY' ? 1 : OBSERVATION.ImageWeighting.find(item => item.label.toLowerCase() === inImageWeighting.toLowerCase())?.value
  }

  const getObservingBand = (inObsBand) => {
    switch(inObsBand) {
      case 'low_band':
        return BANDWIDTH_TELESCOPE.find(item => item.label.includes('Low Band')).value;
      case 'mid_band_1':
        return BANDWIDTH_TELESCOPE.find(item => item.label.includes('Band 1')).value;
      case 'mid_band_2':
        return BANDWIDTH_TELESCOPE.find(item => item.label.includes('Band 2')).value;
      case 'mid_band_3':
        return BANDWIDTH_TELESCOPE.find(item => item.label.includes('Band 5a')).value;
      case 'mid_band_4':
        return BANDWIDTH_TELESCOPE.find(item => item.label.includes('Band 5b')).value;
      default:
        return -1; // not found // TODO handle not found in edit observation?
    }
  }

  const getIntegrationTimeUnits = (InUnits: string) => {
    const integrationTimeSupplied = OBSERVATION.Supplied.find(item => item.label === 'Integration Time');
    switch(InUnits) {
      case 'd':
        const d = integrationTimeSupplied.units.find(item => item.label === 'd').value;
        return d ? d : -1;
      case 'h':
        const h = integrationTimeSupplied.units.find(item => item.label === 'h').value;
        return h ? h : -1;
      case 'min':
        const min = integrationTimeSupplied.units.find(item => item.label === 'min').value;
        return min ? min : -1;
      case 's':
        const s = integrationTimeSupplied.units.find(item => item.label === 's').value;
        return s ? s : -1;
      case 'm / s':
        const mS = integrationTimeSupplied.units.find(item => item.label === 'ms').value;
        return mS ? mS : -1;
      case 'u / s':
        const uS = integrationTimeSupplied.units.find(item => item.label === 'us').value;
        return uS ? uS : -1;
      case 'n / s':
        const nS = integrationTimeSupplied.units.find(item => item.label === 'ns').value;
        return nS ? nS : -1;
      default:
        return -1; // not found
    }
  }

  const getCentralFrequencyUnits = (inUnits: string) => {
    // TODO map once we know possible values
    // we are currently getting "m / s", should it not be MHz or similar like in sens cal?
    return -1;
  }

  const getBandwidthUnits = (inUnits: string) => {
    // TODO map once we know possible values
    // we are currently getting "m / s", should it not be MHz or similar like in sens cal?
    return -1;
  }

  let results = [];

  for (let i = 0; i < inValue.length; i++) {
    const arr = inValue[i].array_details.array === 'ska_mid' ? 1 : 2;
    console.log('inValue[i].array_details.array', inValue[i].array_details.array);
    console.log('inValue[i].array_details.subarray', inValue[i].array_details.subarray);
    const sub = OBSERVATION.array[arr - 1].subarray.find(
      p => p.label.toLowerCase() === inValue[i].array_details.subarray.toLocaleLowerCase()
    ).value;
    console.log('arr', arr);
    console.log('sub', sub);

    let elevation, weather, num15mAntennas, num13mAntennas, numSubBands, tapering;
    if ('elevation' in inValue[i].array_details && 'weather' in inValue[i].array_details) { // TODO remove elevation from condition once ODA updated
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
      type:
        inValue[i].observation_type_details?.observation_type === OBSERVATION_TYPE_BACKEND[0]
          ? 0
          : 1,
      imageWeighting: getWeighting(inValue[i].observation_type_details?.image_weighting),
      observingBand: getObservingBand(inValue[i].observing_band),
      centralFrequency: inValue[i].observation_type_details?.central_frequency.value.toString(),
      // TODO add central frequency unit to proposal type and map it
      centralFrequencyUnits: getCentralFrequencyUnits(inValue[i].observation_type_details?.central_frequency.unit), // TODO map units properly
      elevation: elevation, // TODO map it to root of observation even if undefined for now
      weather: weather,
      num15mAntennas: num13mAntennas,
      num13mAntennas: num15mAntennas,
      numSubBands: numSubBands,
      tapering: tapering,
      bandwidth: inValue[i].observation_type_details.bandwidth.value,
      bandwidthUnits: getBandwidthUnits(inValue[i].observation_type_details.bandwidth.unit), // TODO map units properly
      // TODO add bandwidth unit to proposal type and map it
      integrationTime: inValue[i].observation_type_details?.supplied?.quantity?.value, // integration time: do we need to check the type is integration?
      integrationTimeUnits: getIntegrationTimeUnits(inValue[i].observation_type_details?.supplied?.quantity?.unit),
      spectralResolution: inValue[i].observation_type_details?.spectral_resolution,
      effectiveResolution: inValue[i].observation_type_details?.effective_resolution,
      linked: '',
      continuumBandwidth: '',
      details: ''
    };
    results.push(obs);
  }
  return results;
};

function mapping(inRec: ProposalBackend): Proposal {
  // TODO: finish mapping and add new fields if needed
  console.log('inRec getproposal', inRec);
  const convertedProposal: Proposal = {
    id: inRec.prsl_id,
    title: inRec.info.title,
    proposalType: Projects.find(
      p =>
        p.title.toLowerCase() ===
        convertTypeFormat(inRec.info.proposal_type.main_type).toLowerCase()
    ).id,
    proposalSubType: getSubType(inRec.info.proposal_type),
    status: inRec.status,
    lastUpdated: new Date(inRec.metadata.last_modified_on).toDateString(),
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
    sciencePDF: getPDF(inRec.info.documents, 'proposal_science'), // TODO sort doc link on ProposalDisplay
    scienceLoadStatus: getPDF(inRec.info.documents, 'proposal_science') ? 1 : 0,
    targetOption: 1, // TODO // check what to map to
    targets: getTargets(inRec.info.targets),
    // observations: [], // TODO // getObservations(inRec.info.observation_sets), // TODO add a conversion function to change units to 'm/s' when mapping so we don't have a 'm / s' format in front-end
    observations: getObservations(inRec.info.observation_sets),
    groupObservations: getGroupObservations(inRec.info.observation_sets),
    targetObservation: [], // TODO
    technicalPDF: getPDF(inRec.info.documents, 'proposal_technical'), // TODO sort doc link on ProposalDisplay
    technicalLoadStatus: getPDF(inRec.info.documents, 'proposal_technical') ? 1 : 0,
    DataProductSDP: getDataProductSDP(inRec.info.data_product_sdps),
    DataProductSRC: getDataProductSRC(inRec.info.data_product_src_nets),
    pipeline: '' // TODO check if we can remove this or what should it be mapped to
  };
  console.log('convertedProposal getproposal', convertedProposal);
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
