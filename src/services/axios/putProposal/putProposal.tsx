import axios from 'axios';
import {
  AXIOS_CONFIG,
  DEFAULT_PI,
  GENERAL,
  Projects,
  RA_TYPE_EQUATORIAL,
  SKA_PHT_API_URL,
  USE_LOCAL_DATA,
  VEL_TYPES
} from '../../../utils/constants';
import Proposal, { ProposalBackend } from '../../../utils/types/proposal';
import { helpers } from '../../../utils/helpers';
import Target, { TargetBackend } from 'utils/types/target';
import { DocumentBackend, DocumentPDF } from 'utils/types/document';

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
      const singlePointParam = tar.pointingPattern.parameters.find(param => param.kind === 'SinglePointParameters');
      const outTarget: TargetBackend = {
        target_id: tar.name,
        pointing_pattern: {
          active: tar?.pointingPattern?.active,
          parameters: [
            {
              kind: singlePointParam.kind,
              offset_x_arcsec: singlePointParam.offsetXArcsec,
              offset_y_arcsec: singlePointParam.offsetYArcsec,
            }
          ]
        },
        reference_coordinate: {
          kind: tar.referenceFrame === RA_TYPE_EQUATORIAL ? 'equatorial' : 'galactic',
          ra: Number(tar.ra),
          dec: Number(tar.dec),
          unit: [tar.raUnit, tar.decUnit],
          reference_frame: tar.rcReferenceFrame
        },
        radial_velocity: {
          quantity: {
            value: Number(tar.vel),
            unit: tar.velUnit
          },
          definition: VEL_TYPES.find(item => item.value === tar.velType).label,
          reference_frame: tar.raReferenceFrame,
          redshift: Number(tar.redshift)
        }
      }
      outTargets.push(outTarget);
    }
    return outTargets;
  }

  const getDocuments = (sciencePDF: DocumentPDF, technicalPDF: DocumentPDF): DocumentBackend[] => [
    {
      document_id: sciencePDF.documentId,
      link: sciencePDF.link,
      type: 'proposal_science'
    },
    {
      document_id: technicalPDF.documentId,
      link: technicalPDF.link,
      type: 'proposal_technical'
    }
  ];


// TODO : complete mapping for all properties
const transformedProposal: ProposalBackend = {
  prsl_id: proposal?.id,
  status: status,
  submitted_on: '', // TODO // to fill for submit
  submitted_by: '', // TODO // to fill for submit
  investigator_refs: proposal.team?.map((investigator) => { return investigator.id; }),
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
    documents: getDocuments(proposal.sciencePDF, proposal.technicalPDF),
    investigators: proposal.team.map((teamMember) => {
      return {
        investigator_id: teamMember.id,
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
    data_product_src_nets: [],
    results: []

    /*
    targets: proposal?.targets?.map(target => ({
      name: target?.name,
      right_ascension: target?.ra,
      declination: target?.dec,
      velocity: parseFloat(target?.vel),
      velocity_unit: '', // TODO: confirm what units should be expected
      right_ascension_unit: '', // TODO: confirm what units should be expected
      declination_unit: '' // TODO: confirm what units should be expected
    })),
    */
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
    const convertedProposal = mappingPutProposal(proposal, status);
    console.log('PUT convertedProposal', convertedProposal);
    /*const result = await axios.put(
      `${SKA_PHT_API_URL}${URL_PATH}`,
      convertedProposal,
      AXIOS_CONFIG
    );*/
    const result = 'temp';
    return typeof result === 'undefined' ? 'error.API_UNKNOWN_ERROR' : result // result?.data;
  } catch (e) {
    return { error: e.message };
  }
}

export default PutProposal;
