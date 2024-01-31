import { TEXT_ENTRY_PARAMS, Projects, GENERAL, OBSERVATION } from './constants';

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
        setText(text.substring(0, MAX_LENGTH));
        setErrorText('');
        return true;
      }
      setErrorText(ERROR_TEXT);
      return false;
    }
  },

  transform: {
    /* convert proposal to backend format to send with PUT/PROPOSAL (save button) request and POST/PROPOSAL/REQUEST (submit button) */
    // TODO: handle save/submit scenarios differences => what about Create button? 
    convertProposalToBackendFormat(mockProposal) {

      const project = Projects.find(p => p.id === mockProposal.proposalType);
      const subProject = project?.subProjects.find(sp => sp.id === mockProposal.proposalSubType);

      const targetObservationsByObservation = mockProposal.targetObservation.reduce((acc, to) => {
        if (!acc[to.observationId]) {
          acc[to.observationId] = [];
        }
        acc[to.observationId].push(to.targetId.toString());
        return acc;
      }, {});

      const scienceProgrammes = mockProposal.observations.map(observation => {
        const targetIds = targetObservationsByObservation[observation.id] || [];
        const targets = mockProposal.targets.filter(target => targetIds.includes(target.id.toString()));
        const array = OBSERVATION.array.find(p => p.value === observation.telescope + 1); // TODO: check why array 0-1 in data but 1-2 in CONST
        return {
          science_goal_id: observation.id.toString(), // TODO: check what to map science_goal_id to?
          array: array?.label,
          subarray: array?.subarray.find(sa => sa.value === observation.subarray + 1)?.label, // TODO: check why subArray 0-10 in data but 1-10 in CONST
          linked_sources: targets.map(target => target.name),
          observation_type: OBSERVATION.ObservationType.find(ot => ot.value === observation.type)?.label
        };
      });

      const transformedProposal = {
        prsl_id: mockProposal.id.toString(),
        status: 'draft', // TODO: draft status for save: what's the status when click on submit?
        submitted_by: '', // TODO: fill when clicking on submit
        submitted_on: '', // TODO: fill when clicking on submit
        proposal_info: {
          title: mockProposal.title,
          cycle: mockProposal.cycle,
          abstract: mockProposal.abstract,
          proposal_type: {
            type: project.title,
            sub_type: subProject.title
          },
          science_category: GENERAL.ScienceCategory.find(category => category.value === mockProposal.category).label,
          targets: mockProposal.targets.map(target => ({
            name: target.name,
            right_ascension: target.ra,
            declination: target.dec,
            velocity: parseFloat(target.vel),
            velocity_unit: '', // TODO: confirm what units should be expected
            right_ascension_unit: '', // TODO: confirm what units should be expected
            declination_unit: '' // TODO: confirm what units should be expected
          })),
          investigator: mockProposal.team.map(teamMember => ({
            investigator_id: teamMember.id.toString(),
            first_name: teamMember.firstName,
            last_name: teamMember.lastName,
            email: teamMember.email,
            country: teamMember.country,
            organization: teamMember.affiliation,
            for_phd: teamMember.phdThesis,
            principal_investigator: teamMember.pi
          })),
          science_programmes: scienceProgrammes
        }
      };
      return transformedProposal;
    }
  }
};
