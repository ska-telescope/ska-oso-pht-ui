import axios from 'axios';
import {
  AXIOS_CONFIG,
  DEFAULT_PI,
  GENERAL,
  Projects,
  RA_TYPE_EQUATORIAL,
  REF_COORDINATES_UNITS,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA,
  VEL_UNITS,
  VELOCITY_TYPE,
} from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { helpers } from '../../../utils/helpers';
import Target, { TargetBackend } from 'utils/types/target';
import { DocumentBackend, DocumentPDF } from '../../../utils/types/document';
import { DataProductSRC, DataProductSRCNetBackend } from '../../../utils/types/dataProduct';
import MockProposalBackend from '../getProposal/mockProposalBackend';

/*
TODO:
- test putProposal mapping with data and map all new properties
- tidy up and remove all old mapping functions in this file
*/

function mappingPutProposal(proposal: Proposal, status: string) {

  // TODO: add groupObservations to send to backend

  /*
  const targetObservationsByObservation = proposal.targetObservation?.reduce((acc, to) => {
    if (!acc[to.observationId]) {
      acc[to.observationId] = [];
    }
    acc[to.observationId].push(to.targetId.toString());
    return acc;
  }, {});

  const scienceProgrammes = proposal.observations?.map(observation => {
    const targetIds = targetObservationsByObservation[observation.id] || [];
    const targets = proposal?.targets?.filter(target =>
      targetIds.includes(target.id.toString())
    );
    const array = OBSERVATION.array.find(p => p.value === observation.telescope);
    return {
      array: array?.label,
      subarray: array?.subarray?.find(sa => sa.value === observation.subarray)?.label,
      linked_sources: targets?.map(target => target.name),
      observation_type: OBSERVATION_TYPE_BACKEND[observation.type]
    };
  });
  */

  const convertCategoryFormat = (_inValue: string): string => {
    const words = _inValue.split(' ');
    const lowerCaseWords = words.map(word => word?.charAt(0)?.toLowerCase() + word.slice(1));
    const formattedString = lowerCaseWords.join('_');
    return formattedString;
  };

  const getSubCategory = (proposalType: number, proposalSubType: number[]): any => {
    const project = Projects.find(({ id }) => id === proposalType);
    const subTypes: string[] = [];
    for (let subtype of proposalSubType) {
      const sub = project.subProjects.find(item => item.id === subtype);
      if (sub) {
        const formattedSubType = convertCategoryFormat(sub.title);
        subTypes.push(formattedSubType);
      }
    }
    return subTypes;
  };

  const getTargets = (targets: Target[]): TargetBackend[] => {
    const outTargets = [];
    for (let i = 0; i < targets.length; i++) {
      const tar = targets[i];
      const outTarget: TargetBackend = {
        target_id: tar.name,
        reference_coordinate: {
          kind: REF_COORDINATES_UNITS[0].label, // hardcoded as galactic not handled in backend and not fully implemented in UI (not added to proposal)
          ra: tar.ra,
          dec: tar.dec,
          unit: [REF_COORDINATES_UNITS[0].units[0], REF_COORDINATES_UNITS[0].units[1]], // hardcoded as not fully implemented in UI (not added to proposal)
          reference_frame: tar.rcReferenceFrame? tar.rcReferenceFrame : 'icrs' // hardcoded for now as not implmented in UI
        },
        radial_velocity: {
          quantity: {
            value: tar.velType === VELOCITY_TYPE.VELOCITY ? Number(tar.vel) : 0, // if reference frame is velocity use velocity value, otherwise set to 0
            unit:  VEL_UNITS.find(u => u.value === Number(tar.velUnit))?.label
          },
          definition: 'RADIO', // hardcoded for now as not implemented in UI
          reference_frame: tar.raReferenceFrame ? tar.raReferenceFrame : 'LSRK',
          // hardcoded for now as backend uses TOPOCENTRIC, LSRK & BARYCENTRIC 
          // but UI uses LSRK (Kinematic Local Standard of Rest) & Heliocentric for referenceFrame 
          // -> using raReferenceFrame for now as data format is different
          redshift: tar.velType === VELOCITY_TYPE.REDSHIFT ? Number(tar.redshift) : 0  // if reference frame is redshift use redshift, otherwise set to 0
        }
      };
      /********************* pointing pattern *********************/
      const mockPointingPattern = {
        pointing_pattern: {
          active: 'SinglePointParameters',
          parameters: [
            {
              kind: 'SinglePointParameters',
              offsetXArcsec: 0.5,
              offsetYArcsec: 0.5
            }
          ]
        }
      }
      // As pointingPattern is not currently used in the UI, mock it if it doesn't exist
        const usedSingleParam = tar.pointingPattern ? tar.pointingPattern : mockPointingPattern.pointing_pattern;
        const singlePointParam = usedSingleParam?.parameters?.find(
          param => param.kind === 'SinglePointParameters'
        );
        outTarget['pointing_pattern'] = {
          active: tar.pointingPattern ? tar.pointingPattern?.active : mockPointingPattern.pointing_pattern?.active,
            parameters: [
              {
                kind: singlePointParam?.kind,
                offset_x_arcsec: singlePointParam?.offsetXArcsec,
                offset_y_arcsec: singlePointParam?.offsetYArcsec
              }
            ]
        };
      /***********************************************************/
      outTargets.push(outTarget);
    }
    return outTargets;
  };

  const getDocuments = (sciencePDF: DocumentPDF, technicalPDF: DocumentPDF): DocumentBackend[] => {
    const documents = [];
    if (sciencePDF?.link) {
      documents.push({
        document_id: sciencePDF.documentId,
        link: sciencePDF?.link,
        type: 'proposal_science'
      });
    }
    if (technicalPDF?.link) {
      documents.push({
        document_id: technicalPDF?.documentId,
        link: technicalPDF?.link,
        type: 'proposal_technical'
      });
    }
    return documents;
  };

  const getDataProductSRC = (dataproducts: DataProductSRC[]):DataProductSRCNetBackend[] => {
    return dataproducts?.map(dp => ({ data_products_src_id: dp?.id }));
  }

  // TODO : complete mapping for all properties
  const transformedProposal: ProposalBackend = {
    prsl_id: proposal?.id,
    status: status,
    submitted_on: '', // TODO // to fill for submit
    submitted_by: '', // TODO // to fill for submit
    investigator_refs: proposal.team?.map(investigator => {
      return investigator?.id?.toString();
    }),
    metadata: {
      version: proposal.version + 1,
      created_by: proposal.createdBy,
      created_on: proposal.createdOn,
      last_modified_by: `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}`,
      last_modified_on: new Date().toDateString()
    },
    cycle: GENERAL.Cycle,
    info: {
      title: proposal.title,
      proposal_type: {
        main_type: convertCategoryFormat(Projects.find(p => p.id === proposal.proposalType).title),
        sub_type: getSubCategory(proposal.proposalType, proposal.proposalSubType)
      },
      abstract: proposal.abstract,
      science_category: GENERAL.ScienceCategory?.find(
        category => category.value === proposal?.scienceCategory
      )?.label,
      targets: getTargets(proposal.targets),
      documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF), // TODO check file upload issue
      investigators: proposal.team.map(teamMember => {
        return {
          investigator_id: teamMember.id.toString(),
          given_name: teamMember.firstName,
          family_name: teamMember.lastName,
          email: teamMember.email,
          organization: teamMember.affiliation,
          for_phd: teamMember.phdThesis,
          principal_investigator: teamMember.pi
        };
      }),
      observation_sets: [], // TODO add a conversion function to change units to 'm/s' when mapping so we don't have a 'm / s' format in front-end
      data_product_sdps: [],
      data_product_src_nets: proposal.DataProductSRC?.length > 0 ? getDataProductSRC(proposal.DataProductSRC) : [], // getDataProductSRC(proposal.DataProductSRC), // [],
      results: []
    }
  };
  // trim undefined properties
  helpers.transform.trimObject(transformedProposal);
  return transformedProposal;
}

async function PutProposal(proposal, status?) {
  if (window.Cypress || USE_LOCAL_DATA) {
    return 'success';
  }

  try {
    const URL_PATH = `/proposals/${proposal.id}`;
    // TODO: add testing for proposal conversion format
    console.log('PUT proposal incoming', proposal);
    const convertedProposal = mappingPutProposal(proposal, status);
    console.log('PUT convertedProposal', convertedProposal);
    const result = await axios.put(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result; // result?.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
