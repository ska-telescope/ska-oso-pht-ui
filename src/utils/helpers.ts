import { TEXT_ENTRY_PARAMS, Projects, GENERAL, OBSERVATION, DEFAULT_PI } from './constants';

const specialChars = /[!+]/;

export const helpers = {
  validate: {
    validateTextEntry(
      text: string,
      setText: Function,
      setErrorText: Function,
      textType?: string
    ): boolean {
      textType = textType ?? 'DEFAULT';
      const textEntryParams = TEXT_ENTRY_PARAMS[textType];
      if (!textEntryParams) {
        // handle invalid textType (no match in TEXT_ENTRY_PARAMS)
        throw new Error(`Invalid text type: ${textType}`);
      }
      const { MAX_LENGTH, ERROR_TEXT, PATTERN } = textEntryParams;
      if (PATTERN.test(text)) {
        if (specialChars.test(text)) {
          setText(text);
          setErrorText(ERROR_TEXT);
          return false;
        }
        if (text.length > MAX_LENGTH) {
          setText(text);
          setErrorText('Exceeded expected character count');
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
    convertProposalToBackendFormat(mockProposal, status) {
      const project = Projects.find(p => p.id === mockProposal.proposalType);
      const subProject = project?.subProjects.find(sp => sp.id === mockProposal.proposalSubType);

      // add a team member as PI if none => this is to ensure we have at least 1 team member/PI upon proposal creation
      // TODO: use logged in user instead of hardcoded team member
      if (!('team' in mockProposal)) {
        mockProposal.team = [DEFAULT_PI];
      } else if (mockProposal.team?.length === 0) {
        mockProposal.team.push(DEFAULT_PI);
      }

      const targetObservationsByObservation = mockProposal.targetObservation?.reduce((acc, to) => {
        if (!acc[to.observationId]) {
          acc[to.observationId] = [];
        }
        acc[to.observationId].push(to.targetId.toString());
        return acc;
      }, {});

      const scienceProgrammes = mockProposal.observations?.map(observation => {
        const targetIds = targetObservationsByObservation[observation.id] || [];
        const targets = mockProposal?.targets?.filter(target =>
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
        prsl_id: mockProposal?.id?.toString(),
        status,
        submitted_by:
          status === 'Submitted' ? `${DEFAULT_PI.firstName} ${DEFAULT_PI.lastName}` : '',
        submitted_on: status === 'Submitted' ? new Date().toISOString() : '',
        proposal_info: {
          title: mockProposal?.title,
          cycle: mockProposal?.cycle,
          abstract: mockProposal?.abstract,
          proposal_type: {
            type: project?.title,
            sub_type: subProject?.title
          },
          science_category: GENERAL.ScienceCategory?.find(
            category => category.value === mockProposal?.category
          )?.label,
          targets: mockProposal?.targets?.map(target => ({
            name: target?.name,
            right_ascension: target?.ra,
            declination: target?.dec,
            velocity: parseFloat(target?.vel),
            velocity_unit: '', // TODO: confirm what units should be expected
            right_ascension_unit: '', // TODO: confirm what units should be expected
            declination_unit: '' // TODO: confirm what units should be expected
          })),
          investigator: mockProposal.team?.map(teamMember => ({
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
