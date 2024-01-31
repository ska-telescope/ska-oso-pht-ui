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
    convertProposalToBackendFormat(mockProposal) {
      const project = Projects.find(p => p.id === mockProposal.proposalType);
      const subProject = project?.subProjects.find(sp => sp.id === mockProposal.proposalSubType);

      const transformedProposal = {
        prsl_id: mockProposal.id.toString(),
        status: 'draft',
        submitted_by: '',
        submitted_on: '',
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
            velocity_unit: 'km/s', // TODO: confirm what units should be expected
            right_ascension_unit: target.ra.includes(':') ? 'hh:mm:ss' : 'degrees', // TODO: confirm what units should be expected
            declination_unit: 'dd:mm:ss' // TODO: confirm what units should be expected
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
          science_programmes: mockProposal.observations.map(observation => {
            // TODO: confirm linked obesrvations format for the backend
            const targetObservation = mockProposal.targetObservation.find(
              to => to.observationId === observation.id
            );
            const target = mockProposal.targets.find(
              foundTarget => foundTarget.id === (targetObservation || {}).targetId
            );
            const array = OBSERVATION.array.find(p => p.value === observation.telescope + 1); // **
            const linkedSources = [];
            return {
              // TODO: map arrays and subarrays properly
              science_goal_id: observation.id.toString(), // what's science goal? Is it different than science category?
              array: array?.label, // MID or LOW - ? why is it 0 and 1 in mock proposal but OBSERVATION.array I see 1 and 2?
              subarray: array?.subarray.find(sa => sa.value === observation.subarray + 1)?.label, // same with sub-array see id 0 to 3 in mock but OBS.array 1-20
              // linked_sources: (target || {}).name ? [target.name] : [],
              // linked_sources: target? linkedSources.push(target?.name): linkedSources,
              observation_type: OBSERVATION.ObservationType.find(ot => ot.value === observation.type)?.label
            };
          })
        }
      };
      return transformedProposal;
    }
  }
};
