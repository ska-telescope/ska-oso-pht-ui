import { useUserGroups } from '@ska-telescope/ska-login-page';
import { useMsal } from '@azure/msal-react';
import { APP_OVERRIDE_GROUPS, TMP_REVIEWER_ID } from '../constants';
import ProposalAccess from '../types/proposalAccess';

// Internal access store
let _userGroups: ReturnType<typeof useUserGroups> | null = null;
let _account: any = null;

export function useInitializeAccessStore() {
  _userGroups = useUserGroups();
  const { accounts } = useMsal();
  _account = accounts?.[0] ?? null;
}

function getUserGroups() {
  if (!_userGroups) throw new Error('Access store not initialized');
  return _userGroups;
}

function getAccount() {
  return _account;
}

// Constants
export const PROPOSAL_ACCESS_VIEW = 'view';
export const PROPOSAL_ACCESS_UPDATE = 'update';
export const PROPOSAL_ACCESS_SUBMIT = 'submit';
export const PROPOSAL_ACCESS_PERMISSIONS = [
  PROPOSAL_ACCESS_VIEW,
  PROPOSAL_ACCESS_UPDATE,
  PROPOSAL_ACCESS_SUBMIT
];
export const PROPOSAL_ROLE_PI = 'Principal Investigator';

export const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309';
export const OPS_REVIEW_CHAIR = 'obs-oauth2role-opsreviewerchair-11741547065';
export const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-scireviewer-1635769025';
export const EXT_REVIEWER_TECHNICAL = 'obs-oauth2role-tecreviewer-1-1994146425';
export const SW_ENGINEER = 'obs-integrationenvs-oauth2role-sweng-11162868063';

// Access logic
const hasOverride = () => APP_OVERRIDE_GROUPS && APP_OVERRIDE_GROUPS.length > 0;
const testOverride = (group: string) => APP_OVERRIDE_GROUPS.split(',').includes(group);

export const hasAccess = (group: string) =>
  hasOverride() ? testOverride(group) : getUserGroups().hasGroup(group);

export const isSoftwareEngineer = () => hasAccess(SW_ENGINEER);

export const isReviewerAdminOnly = () => !isSoftwareEngineer() && hasAccess(OPS_PROPOSAL_ADMIN);
export const isReviewerAdmin = () => isSoftwareEngineer() || isReviewerAdminOnly();
export const isReviewerScience = () =>
  hasAccess(SW_ENGINEER) || hasAccess(OPS_REVIEWER_SCIENCE) || isReviewerAdminOnly();
export const isReviewerTechnical = () =>
  isReviewerAdminOnly() || hasAccess(SW_ENGINEER) || hasAccess(EXT_REVIEWER_TECHNICAL);
export const isReviewer = () =>
  hasAccess(SW_ENGINEER) || isReviewerScience() || isReviewerTechnical();
export const isReviewerChair = () =>
  isReviewerAdminOnly() || hasAccess(SW_ENGINEER) || hasAccess(OPS_REVIEW_CHAIR);

// Account access
export const getUserId = () => {
  return TMP_REVIEWER_ID;
  /* Ready for implementation when appropriate
  const account = getAccount();
  return account && typeof account === 'object' && 'localAccountId' in account
    ? (account as { localAccountId?: string }).localAccountId ?? ''
    : '';
  */
};

export const getUserName = () => {
  const account = getAccount();
  return account && typeof account === 'object' && 'name' in account
    ? (account as { name?: string }).name ?? ''
    : '';
};

// Proposal access
export const hasProposalAccess = (
  accessList: ProposalAccess[],
  prslId: string
): ProposalAccess | null => {
  return accessList.find(access => access.prslId === prslId) ?? null;
};

export const hasProposalAccessPermission = (
  accessList: ProposalAccess[],
  prslId: string,
  permission: string
): boolean => {
  const access = hasProposalAccess(accessList, prslId);
  return access?.permissions.includes(permission) ?? false;
};

export const accessPI = (accessList: ProposalAccess[], id: string): boolean => {
  const access = hasProposalAccess(accessList, id);
  return access?.role.includes(PROPOSAL_ROLE_PI) ?? false;
};

export const accessSubmit = (accessList: ProposalAccess[], id: string): boolean =>
  hasProposalAccessPermission(accessList, id, PROPOSAL_ACCESS_SUBMIT);

export const accessUpdate = (accessList: ProposalAccess[], id: string): boolean => {
  const submit = accessSubmit(accessList, id);
  const update = hasProposalAccessPermission(accessList, id, PROPOSAL_ACCESS_UPDATE);
  return submit || update;
};

export const accessView = (accessList: ProposalAccess[], id: string): boolean => {
  const update = accessUpdate(accessList, id);
  const view = hasProposalAccessPermission(accessList, id, PROPOSAL_ACCESS_VIEW);
  return update || view;
};

export function __setAccount(account: any) {
  _account = account;
}

export function __setUserGroups(groups: any) {
  _userGroups = groups;
}
