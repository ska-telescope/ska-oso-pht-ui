import { Proposal } from 'utils/types/proposal';
import { TEXT_ENTRY_PARAMS, Projects, GENERAL, OBSERVATION, DEFAULT_PI } from './constants';

const specialChars = /[!]/;

// TODO : Ensure that we remove all hard-coded values

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
        if (specialChars.test(text)) {
          setText(text);
          setErrorText(ERROR_TEXT);
          return false;
        }
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
        if (value === undefined || value === '') {
          if (key === 'submitted_by' || key === 'submitted_on' || key === 'abstract') return; //TODO: review null values in data model
          delete obj[key];
        } else if (typeof value === 'object') {
          this.trimObject(value);
        }
      });
    },

    /* convert proposal to backend format to send with PUT/PROPOSAL (save button) and PUT/PROPOSAL/ (submit button) */
    // TODO: handle save/submit/create scenarios differences
    /*
    CREATE = proposal with no observations, etc.
    SAVE = proposal with or without observations, etc. STATUS: draft
    SUBMIT = STATUS: submitted
    */
    convertProposalToBackendFormat(proposal: Proposal, status: string) {
      const project = Projects.find(p => p.id === proposal.proposalType);
      const subProject = project?.subProjects.find(sp => sp.id === proposal.proposalSubType);

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
          observation_type: OBSERVATION.ObservationType.find(ot => ot.value === observation.type)
            ?.label
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
