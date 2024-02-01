import { TEXT_ENTRY_PARAMS, Projects } from './constants';

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
        if(text.includes("*")){
          setText(text);
          setErrorText(ERROR_TEXT);
          return false;
        }
        if(text.length > MAX_LENGTH) {
          setText(text);
          setErrorText("Exceeded expected character count");
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
          science_category: mockProposal.category.toString(),
          targets: mockProposal.targets.map(target => ({
            name: target.name,
            right_ascension: target.ra,
            declination: target.dec,
            velocity: parseFloat(target.vel),
            velocity_unit: 'km/s', // TODO: confirm what units should be expected and strategy
            right_ascension_unit: target.ra.includes(':') ? 'hh:mm:ss' : 'degrees', // TODO: confirm what units should be expected and strategy
            declination_unit: 'dd:mm:ss' // TODO: confirm what units should be expected and strategy
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
            return {
              science_goal_id: observation.id.toString(),
              array: observation.telescope.toString(),
              subarray: `subarray ${observation.subarray.toString()}`,
              linked_sources: (target || {}).name ? [target.name] : [],
              observation_type: observation.type === 1 ? 'Continuum' : 'Spectral Line'
            };
          })
        }
      };
      return transformedProposal;
    }
  }
};
