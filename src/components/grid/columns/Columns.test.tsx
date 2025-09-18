import { describe, it, expect, vi } from 'vitest';
import {
  getColTitle,
  getColDisplayName,
  getColGivenName,
  getColSurname,
  getColReviewerLocation,
  getColReviewerType,
  getColSubExpertise,
  getColStatus
} from './Columns';

vi.mock('i18next', () => ({
  t: (key: string) => `translated(${key})`
}));

describe('Column Definitions', () => {
  const mockRow = {
    jobTitle: 'Astrophysicist',
    displayName: 'Dr. Jane Doe',
    givenName: 'Jane',
    surname: 'Doe',
    officeLocation: 'Cape Town',
    subExpertise: 'radio',
    status: 'active',
    isScience: true,
    isTechnical: false
  };

  it('getColTitle returns correct config', () => {
    const col = getColTitle();
    expect(col.field).toBe('title');
    expect(col.headerName).toBe('translated(reviewers.title)');
    expect(col.renderCell({ row: mockRow })).toBe('Astrophysicist');
  });

  it('getColDisplayName returns correct config', () => {
    const col = getColDisplayName();
    expect(col.field).toBe('displayName');
    expect(col.headerName).toBe('translated(reviewers.displayName)');
    expect(col.renderCell({ row: mockRow })).toBe('Dr. Jane Doe');
  });

  it('getColGivenName returns correct config', () => {
    const col = getColGivenName();
    expect(col.field).toBe('givenName');
    expect(col.renderCell({ row: mockRow })).toBe('Jane');
  });

  it('getColSurname returns correct config', () => {
    const col = getColSurname();
    expect(col.field).toBe('surname');
    expect(col.renderCell({ row: mockRow })).toBe('Doe');
  });

  it('getColReviewerLocation returns correct config', () => {
    const col = getColReviewerLocation();
    expect(col.field).toBe('officeLocation');
    expect(col.renderCell({ row: mockRow })).toBe('Cape Town');
  });

  it('getColReviewerType returns correct config and renders type', () => {
    const mockSetType = vi.fn();
    const col = getColReviewerType('sci', mockSetType);
    expect(col.field).toBe('reviewerType');
    expect(col.renderCell({ row: mockRow })).toBe('translated(reviewerType.science)');
    expect(typeof col.renderHeader).toBe('function');
  });

  it('getColSubExpertise returns correct config', () => {
    const col = getColSubExpertise();
    expect(col.field).toBe('subExpertise');
    expect(col.renderCell({ row: mockRow })).toBe(
      'translated(reviewers.subExpertiseCategory.radio)'
    );
  });

  it('getColStatus returns correct config', () => {
    const col = getColStatus();
    expect(col.field).toBe('status');
    expect(col.renderCell({ row: mockRow })).toBe('translated(reviewers.statusCategory.active)');
  });
});
