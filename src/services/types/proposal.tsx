export type Proposal = {
  id: number;
  title: string;
  proposalType: number;
  proposalSubType: number;
  // Team
  team: [];
  // General
  abstract: string;
  category: number;
  subCategory: number;
  // Target
  targetOption: number;
  targets: [];
};
