import { Proposal } from 'utils/types/proposal';
import {
  TEXT_ENTRY_PARAMS,
  Projects,
  GENERAL,
  OBSERVATION,
  DEFAULT_PI,
  OBSERVATION_TYPE_BACKEND
} from './constants';

// TODO : Ensure that we remove all hard-coded values

export const generateId = (prefix: string, length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return prefix + result;
};

export const countWords = (text: string) => {
  return !text
    ? 0
    : text
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;
};

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: string
    ): boolean {
      // eslint-disable-next-line react-hooks/rules-of-hooks

      textType = textType ?? 'DEFAULT';
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        setText(text);
        setErrorText('');
        return true;
      }
      setErrorText(ERROR_TEXT);
      return false;
    }
  },

  transform: {
    // trim undefined and empty properties of an object
    trimObject(obj) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === undefined || value === '' || value === null) {
          if (key === 'submitted_by' || key === 'submitted_on' || key === 'abstract') return; //TODO: review null values in data model
          delete obj[key];
        } else if (typeof value === 'object') {
          this.trimObject(value);
        }
      });
    },

    /* convert proposal to backend format to send with PUT/PROPOSAL (save button) and PUT/PROPOSAL/ (submit button) */
    // TODO: move this into the PUT proposal service (and POST?)
    // TODO: handle saving PDF filename as document_id and link
    // "documents" : [
    //   {"document_id" : "prsl-12334-science",         "link": 'download pdf'}

    //   ,

    //   {"document_id" : "prsl-12334-technical",          "link": 'download pdf'     }

    //   ]
    /*
    CREATE = proposal with no observations, etc.
    SAVE = proposal with or without observations, etc. STATUS: draft
    SUBMIT = STATUS: submitted
    */
    convertProposalToBackendFormat(proposal: Proposal, status: string) {
      const project = Projects.find(p => p.id === proposal.proposalType);
      // TODO : We need to update so that 0 - n entries are added.
      const subProject = project?.subProjects.find(sp => sp.id === proposal.proposalSubType[0]);

      // TODO: add groupObservations to send to backend

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

      const transformedProposal = {
        prsl_id: proposal?.id?.toString(),
        status,
        submitted_by:
          status === 'Submitted' ? `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}` : '',
        submitted_on: status === 'Submitted' ? new Date().toISOString() : '',
        proposal_info: {
          title: proposal?.title,
          cycle: GENERAL.Cycle,
          abstract: proposal?.abstract,
          proposal_type: {
            main_type: project?.title,
            sub_type: subProject?.title
          },
          science_category: GENERAL.ScienceCategory?.find(
            category => category.value === proposal?.category
          )?.label,
          targets: proposal?.targets?.map(target => ({
            name: target?.name,
            right_ascension: target?.ra,
            declination: target?.dec,
            velocity: parseFloat(target?.vel),
            velocity_unit: '', // TODO: confirm what units should be expected
            right_ascension_unit: '', // TODO: confirm what units should be expected
            declination_unit: '' // TODO: confirm what units should be expected
          })),
          investigators: proposal.team?.map(teamMember => ({
            investigator_id: teamMember.id?.toString(),
            first_name: teamMember?.firstName,
            last_name: teamMember?.lastName,
            email: teamMember?.email,
            country: teamMember?.country,
            organization: teamMember?.affiliation,
            for_phd: teamMember?.phdThesis,
            principal_investigator: teamMember?.pi
          })),
          science_programmes: scienceProgrammes
        }
      };

      // trim undefined properties
      this.trimObject(transformedProposal);

      return transformedProposal;
    }
  }
};
