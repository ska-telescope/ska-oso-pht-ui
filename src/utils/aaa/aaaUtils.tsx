import { useUserGroups } from '@ska-telescope/ska-login-page';
import { useMsal } from '@azure/msal-react';
import { APP_OVERRIDE_GROUPS, TMP_REVIEWER_ID } from '../constants';

const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309'; //'ce3627de-8ec2-4a35-ab1e-300eec6a0a50';
const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-opsreviewersci-1635769025'; // '05883c37-b723-4b63-9216-0a789a61cb07';
const OPS_REVIEWER_TECHNICAL = 'obs-oauth2role-opsreviewertec-1-1994146425'; // '4c45b2ea-1b56-4b2d-b209-8d970b4e39dc';
const SW_ENGINEER = 'obs-integrationenvs-oauth2role-sweng-11162868063';

const hasOverride = () => APP_OVERRIDE_GROUPS && APP_OVERRIDE_GROUPS.length > 0;

const testOverride = (group: string) => APP_OVERRIDE_GROUPS.split(',').includes(group);

const PermissionGroup = () => {
  return useUserGroups();
};

export const hasAccess = (group: string) =>
  hasOverride() ? testOverride(group) : PermissionGroup().hasGroup(group);

export const isSoftwareEngineer = () => hasAccess(SW_ENGINEER);

export const isReviewerAdmin = () => hasAccess(SW_ENGINEER) || hasAccess(OPS_PROPOSAL_ADMIN);
export const isReviewerScience = () => hasAccess(SW_ENGINEER) || hasAccess(OPS_REVIEWER_SCIENCE);
export const isReviewerTechnical = () =>
  hasAccess(SW_ENGINEER) || hasAccess(OPS_REVIEWER_TECHNICAL);
export const isReviewer = () =>
  hasAccess(SW_ENGINEER) || isReviewerScience() || isReviewerTechnical();
export const isReviewerChair = () => hasAccess(SW_ENGINEER) || isReviewerAdmin(); // Placeholder for future implementation

/*****************************************************************************/

const Account = () => {
  const { accounts } = useMsal();
  return accounts.length > 0 ? accounts[0] : '';
};

export const getUserId = () => {
  return TMP_REVIEWER_ID;
  /* This is ready for implementation when appropriate, just double check the Id is the correct one
  const account = Account();
  return account && typeof account === 'object' && 'localAccountId' in account
    ? (account as { localAccountId?: string }).localAccountId ?? ''
    : '';
    */
};

export const getUserName = () => {
  const account = Account();
  return account && typeof account === 'object' && 'name' in account
    ? (account as { name?: string }).name ?? ''
    : '';
};
