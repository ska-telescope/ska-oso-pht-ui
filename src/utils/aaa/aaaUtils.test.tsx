import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  hasAccess,
  isSoftwareEngineer,
  isReviewerAdmin,
  isReviewerScience,
  isReviewerTechnical,
  isReviewer,
  isReviewerChair
} from './aaaUtils';

const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309';
const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-opsreviewersci-1635769025';
const OPS_REVIEWER_TECHNICAL = 'obs-oauth2role-opsreviewertec-1-1994146425';
const SW_ENGINEER = 'obs-integrationenvs-oauth2role-sweng-11162868063';
// 👇 Mutable override value
let overrideGroups = '';

vi.mock('../constants', () => ({
  get APP_OVERRIDE_GROUPS() {
    return overrideGroups;
  }
}));

describe('Permission utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    overrideGroups = ''; // Reset override before each test
  });

  it('hasAccess returns true when override matches', () => {
    overrideGroups = 'groupA';
    expect(hasAccess('groupA')).toBe(true);
    expect(hasAccess('groupC')).toBe(false);
  });

  it('isSoftwareEngineer returns true if SW_ENGINEER', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isSoftwareEngineer()).toBe(false);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isSoftwareEngineer()).toBe(false);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isSoftwareEngineer()).toBe(false);
    overrideGroups = SW_ENGINEER;
    expect(isSoftwareEngineer()).toBe(true);
  });

  it('isReviewerAdmin returns true if SW_ENGINEER or OPS_PROPOSAL_ADMIN', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isReviewerAdmin()).toBe(true);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isReviewerAdmin()).toBe(false);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isReviewerAdmin()).toBe(false);
    overrideGroups = SW_ENGINEER;
    expect(isReviewerAdmin()).toBe(true);
  });

  it('isReviewerScience returns true if SW_ENGINEER or OPS_REVIEWER_SCIENCE', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isReviewerScience()).toBe(false);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isReviewerScience()).toBe(true);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isReviewerScience()).toBe(false);
    overrideGroups = SW_ENGINEER;
    expect(isReviewerScience()).toBe(true);
  });

  it('isReviewerTechnical returns true if SW_ENGINEER or OPS_REVIEWER_TECHNICAL', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isReviewerTechnical()).toBe(false);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isReviewerTechnical()).toBe(false);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isReviewerTechnical()).toBe(true);
    overrideGroups = SW_ENGINEER;
    expect(isReviewerTechnical()).toBe(true);
  });

  it('isReviewer returns true if any reviewer role matches', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isReviewer()).toBe(false);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isReviewer()).toBe(true);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isReviewer()).toBe(true);
    overrideGroups = SW_ENGINEER;
    expect(isReviewer()).toBe(true);
  });

  it('isReviewerChair returns true if SW_ENGINEER or isReviewerAdmin', () => {
    overrideGroups = OPS_PROPOSAL_ADMIN;
    expect(isReviewerChair()).toBe(true);
    overrideGroups = OPS_REVIEWER_SCIENCE;
    expect(isReviewerChair()).toBe(false);
    overrideGroups = OPS_REVIEWER_TECHNICAL;
    expect(isReviewerChair()).toBe(false);
    overrideGroups = SW_ENGINEER;
    expect(isReviewerChair()).toBe(true);
  });

  // TODO : Add testing for accessView, accessUpdate, accessSubmit & accessPI
});
