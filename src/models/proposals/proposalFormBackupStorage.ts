import { ProposalType } from './proposal';

const BACKUP_PREFIX = 'skao:proposal-form:v1:';

type ProposalFormBackup = {
  version: 1;
  proposalId: string;
  values: ProposalType;
};

export const proposalFormBackupKey = (proposalId: string) =>
  `${BACKUP_PREFIX}${encodeURIComponent(proposalId)}`;

export function loadProposalFormBackup(proposalId: string): ProposalType | null {
  try {
    const raw = window.localStorage.getItem(proposalFormBackupKey(proposalId));
    if (!raw) return null;
    const backup = JSON.parse(raw) as Partial<ProposalFormBackup>;
    if (
      backup.version !== 1 ||
      backup.proposalId !== proposalId ||
      !backup.values ||
      typeof backup.values !== 'object'
    ) {
      return null;
    }
    return backup.values;
  } catch {
    return null;
  }
}

export function saveProposalFormBackup(proposalId: string, values: ProposalType) {
  try {
    const backup: ProposalFormBackup = { version: 1, proposalId, values };
    window.localStorage.setItem(proposalFormBackupKey(proposalId), JSON.stringify(backup));
  } catch {
    // Storage can be unavailable or full.
  }
}

export function clearProposalFormBackup(proposalId: string) {
  try {
    window.localStorage.removeItem(proposalFormBackupKey(proposalId));
  } catch {
    // Storage can be unavailable.
  }
}
