// The purpose of this file is to provide a set of abstract user fixtures for use in Cypress tests.
// These map to real IAM accounts provisioned for testing purposes, representing different user roles within the application.
// This file documents and centralizes the user fixtures, making it easier to manage and update them as needed.

import {
  OPS_PROPOSAL_ADMIN,
  OPS_REVIEW_CHAIR,
  OPS_REVIEWER_SCIENCE,
  EXT_REVIEWER_TECHNICAL
} from '../../../../src/utils/aaa/aaaUtils';

// `username` names which live IAM account (see cypressTestAuth.js's ACCOUNTS) initialize() logs
// in as for this fixture - astronomer1 isn't granted any of the reviewer/admin roles below.

export const standardUser = {
  name: 'Cypress Default User',
  username: 'astronomer1',
  group: ''
};

// For the moment all four reviewer scenarios point at sciops1.
// Once the review roles and scopes more clearly defined for SKA and provisioned as test users in the IAM system,
// these fixtures can be updated to point at the appropriate accounts.

export const reviewerScience = {
  name: 'Cypress Science Reviewer',
  username: 'sciops1',
  group: OPS_REVIEWER_SCIENCE
};

export const reviewerTechnical = {
  name: 'Cypress Technical Reviewer',
  username: 'sciops1',
  group: EXT_REVIEWER_TECHNICAL
};

export const reviewerChairman = {
  name: 'Cypress Review Chairman',
  username: 'sciops1',
  group: OPS_REVIEW_CHAIR
};

export const reviewerAdmin = {
  name: 'Cypress Review Administrator',
  username: 'sciops1',
  group: OPS_PROPOSAL_ADMIN
};
