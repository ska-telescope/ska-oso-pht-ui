import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProposalAccess from '../types/proposalAccess';
import {
  hasAccess,
  isSoftwareEngineer,
  isReviewerAdmin,
  isReviewerScience,
  isReviewerTechnical,
  isReviewer,
  isReviewerChair,
  accessPI,
  accessSubmit,
  accessUpdate,
  accessView,
  hasProposalAccess,
  hasProposalAccessPermission
} from './aaaUtils';

const OPS_PROPOSAL_ADMIN = 'obs-oauth2role-opsproposaladmin-1-1535351309';
const OPS_REVIEWER_SCIENCE = 'obs-oauth2role-opsreviewersci-1635769025';
const OPS_REVIEWER_TECHNICAL = 'obs-oauth2role-opsreviewertec-1-1994146425';
const SW_ENGINEER = 'obs-integrationenvs-oauth2role-sweng-11162868063';
// 👇 Mutable override value
let overrideGroups = '';

const PROPOSAL_ACCESS_VIEW = 'view';
const PROPOSAL_ACCESS_UPDATE = 'update';
const PROPOSAL_ACCESS_SUBMIT = 'submit';
const PROPOSAL_ROLE_PI = 'Principle Investigator';

const mockAccessList: ProposalAccess[] = [
  {
    id: 'access-001',
    prslId: 'prsl-001',
    userId: 'user-001',
    permissions: [PROPOSAL_ACCESS_SUBMIT, PROPOSAL_ACCESS_VIEW],
    role: PROPOSAL_ROLE_PI
  },
  {
    id: 'access-002',
    prslId: 'prsl-002',
    userId: 'user-002',
    permissions: [PROPOSAL_ACCESS_UPDATE],
    role: 'Co-Investigator'
  }
];

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
});

describe('Access Utilities', () => {
  it('hasProposalAccess returns correct access object', () => {
    const result = hasProposalAccess(mockAccessList, 'prsl-001');
    expect(result?.prslId).toBe('prsl-001');
  });

  it('hasProposalAccess returns null for unknown ID', () => {
    const result = hasProposalAccess(mockAccessList, 'prsl-999');
    expect(result).toBeNull();
  });

  it('hasProposalAccessPermission returns true for valid permission', () => {
    const result = hasProposalAccessPermission(mockAccessList, 'prsl-001', PROPOSAL_ACCESS_VIEW);
    expect(result).toBe(true);
  });

  it('hasProposalAccessPermission returns false for missing permission', () => {
    const result = hasProposalAccessPermission(mockAccessList, 'prsl-001', PROPOSAL_ACCESS_UPDATE);
    expect(result).toBe(false);
  });

  it('hasProposalAccessPermission returns false for unknown ID', () => {
    const result = hasProposalAccessPermission(mockAccessList, 'prsl-999', PROPOSAL_ACCESS_VIEW);
    expect(result).toBe(false);
  });

  it('accessPI returns true for PI role', () => {
    const result = accessPI(mockAccessList, 'prsl-001');
    expect(result).toBe(true);
  });

  it('accessPI returns false for non-PI role', () => {
    const result = accessPI(mockAccessList, 'prsl-002');
    expect(result).toBe(false);
  });

  it('accessSubmit returns true if submit permission exists', () => {
    const result = accessSubmit(mockAccessList, 'prsl-001');
    expect(result).toBe(true);
  });

  it('accessSubmit returns false if submit permission is missing', () => {
    const result = accessSubmit(mockAccessList, 'prsl-002');
    expect(result).toBe(false);
  });

  it('accessUpdate returns true if update or submit permission exists', () => {
    expect(accessUpdate(mockAccessList, 'prsl-001')).toBe(true); // submit
    expect(accessUpdate(mockAccessList, 'prsl-002')).toBe(true); // update
  });

  it('accessUpdate returns false if neither permission exists', () => {
    const result = accessUpdate([], 'prsl-001');
    expect(result).toBe(false);
  });

  it('accessView returns true if view or update or submit permission exists', () => {
    expect(accessView(mockAccessList, 'prsl-001')).toBe(true); // view + submit
    expect(accessView(mockAccessList, 'prsl-002')).toBe(true); // update
  });

  it('accessView returns false if no relevant permission exists', () => {
    const result = accessView([], 'prsl-001');
    expect(result).toBe(false);
  });
});
