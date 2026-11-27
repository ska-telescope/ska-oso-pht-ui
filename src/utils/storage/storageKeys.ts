export const STORAGE_KEYS = {
  appColors: 'app:getColors:v1',
  themeA11y: 'app:themeA11y:v1',
  // Local, unsaved edits to a proposal, one entry per proposal
  proposalDraft: (prslId: string) => `pht:proposalDraft:${prslId}`
} as const;
