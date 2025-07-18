export type CycleData = {
  cycle_description: string;
  cycle_information: { cycle_id: string; proposal_close: string; proposal_open: string };
  cycle_number: number;
  cycle_policies: { normal_max_hours: number };
  telescope_capabilities: { Low: string; Mid: string };
};

export default CycleData;
