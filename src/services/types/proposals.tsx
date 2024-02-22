export type ProposalsIN = {
  prsl_id: number;
  status: string;
  submitted_by: string;
  submitted_on: string;
  proposal_info: {
    title: string;
    cycle: string;
    abstract: string;
    proposal_type: { main_type: string; sub_type: string };
    science_category: string;
    targets: {
      name: string;
      right_ascension: string;
      declination: string;
      velocity: number;
      velocity_unit: string;
      right_ascension_unit: string;
      declination_unit: string;
    }[];
    investigator: {
      investigator_id: string;
      first_name: string;
      last_name: string;
      country: string;
      email: string;
      organization: string;
      for_phd: true;
      principal_investigator: true;
    }[];
    science_programmes: {
      science_goal_id: string;
      array: string;
      subarray: string;
      linked_sources: string[];
      observation_type: string;
    }[];
  };
};

export type Proposals = {
  id: string;
  title: string;
  cycle: string;
  pi: string;
  cpi: string;
  status: string;
  lastUpdated: string;
  telescope: string;
};

export default Proposals;
