// There are also in the aaaUtils.tsx file, but I didn't want to import them at this time

const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309';
const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-opsreviewersci-1635769025';
const OPS_REVIEWER_TECHNICAL = 'obs-oauth2role-opsreviewertec-1-1994146425';

export const defaultUser = {
  name: 'Cypress Default User',
  group: ''
};

export const reviewerScience = {
  name: 'Cypress Science Reviewer',
  group: OPS_REVIEWER_SCIENCE
};

export const reviewerTechnical = {
  name: 'Cypress Technical Reviewer',
  group: OPS_REVIEWER_TECHNICAL
};

export const reviewerChairman = {
  name: 'Cypress Review Chairman',
  group: OPS_PROPOSAL_ADMIN
};

export const reviewerAdmin = {
  name: 'Cypress Review Administrator',
  group: OPS_PROPOSAL_ADMIN
};
