// There are also in the aaaUtils.tsx file, but I didn't want to import them at this time

const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309';
const OPS_REVIEW_CHAIR = 'obs-oauth2role-opsreviewerchair-11741547065';
const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-scireviewer-1635769025';
const EXT_REVIEWER_TECHNICAL = 'obs-oauth2role-tecreviewer-1-1994146425';

export const standardUser = {
  name: 'Cypress Default User',
  group: ''
};

// liveOps: true routes initialize() to log in as sciops1 (via cypressTestAuth.js's
// loginAsOpsUser) instead of the default astronomer1 - see common.js's initialize() and
// cypressTestAuth.js's comment on DEFAULT_OPS_USERNAME. sciops1 is only granted
// app:pht:ops_proposal_admin, app:pht:ops_reviewer_science and app:pht:ops_reviewer_technical, so
// reviewerChairman is deliberately left on astronomer1 below - there's no live account yet with
// the chair role, so setting liveOps here would just swap which unauthorized identity backend
// requests fail under.

export const reviewerScience = {
  name: 'Cypress Science Reviewer',
  group: OPS_REVIEWER_SCIENCE,
  liveOps: true
};

export const reviewerTechnical = {
  name: 'Cypress Technical Reviewer',
  group: EXT_REVIEWER_TECHNICAL,
  liveOps: true
};

export const reviewerChairman = {
  name: 'Cypress Review Chairman',
  group: OPS_REVIEW_CHAIR
};

export const reviewerAdmin = {
  name: 'Cypress Review Administrator',
  group: OPS_PROPOSAL_ADMIN,
  liveOps: true
};
