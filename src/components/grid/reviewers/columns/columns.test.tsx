import { describe, it, expect, vi } from 'vitest';
import {
  getColJobTitle,
  getColDisplayName,
  getColGivenName,
  getColSurname,
  getColReviewerLocation,
  getColReviewerType,
  getColSubExpertise,
  getColStatus
} from './columns';

vi.mock('i18next', () => ({
  t: (key: string) => `translated(${key})`
}));

vi.mock('@/utils/present/present', () => ({
  presentLatex: (text: string) => `latex(${text})`,
  presentDate: (ts: string) => `date(${ts})`,
  presentTime: (ts: string) => `time(${ts})`
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content3: {
          observatoryPolicy: {
            cycleInformation: {
              proposalClose: '20250930T12:00:00'
            }
          }
        }
      }
    })
  }
}));

const t = (key: string) => `translated(${key})`;

describe('Reviewer Column Definitions', () => {
  const baseRow = {
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

  it('getColJobTitle', () => {
    const col = getColJobTitle(t);
    expect(col.field).toBe('title');
    expect(col.headerName).toBe('translated(reviewers.title)');
    expect(col.renderCell({ row: baseRow })).toBe('Astrophysicist');
  });

  it('getColDisplayName', () => {
    const col = getColDisplayName(t);
    expect(col.field).toBe('displayName');
    expect(col.headerName).toBe('translated(reviewers.displayName)');
    expect(col.renderCell({ row: baseRow })).toBe('Dr. Jane Doe');
  });

  it('getColGivenName', () => {
    const col = getColGivenName(t);
    expect(col.field).toBe('givenName');
    expect(col.headerName).toBe('translated(reviewers.givenName)');
    expect(col.renderCell({ row: baseRow })).toBe('Jane');
  });

  it('getColSurname', () => {
    const col = getColSurname(t);
    expect(col.field).toBe('surname');
    expect(col.headerName).toBe('translated(reviewers.surname)');
    expect(col.renderCell({ row: baseRow })).toBe('Doe');
  });

  it('getColReviewerLocation', () => {
    const col = getColReviewerLocation(t);
    expect(col.field).toBe('officeLocation');
    expect(col.headerName).toBe('translated(location.label)');
    expect(col.renderCell({ row: baseRow })).toBe('Cape Town');
  });

  describe('getColReviewerType', () => {
    const mockSetType = vi.fn();

    it('renders science', () => {
      const col = getColReviewerType(t, 'sci', mockSetType);
      expect(col.renderCell({ row: baseRow })).toBe('translated(reviewerType.science)');
    });

    it('renders technical', () => {
      const row = { ...baseRow, isScience: false, isTechnical: true };
      const col = getColReviewerType(t, 'tec', mockSetType);
      expect(col.renderCell({ row })).toBe('translated(reviewerType.technical)');
    });

    it('renders both', () => {
      const row = { ...baseRow, isScience: true, isTechnical: true };
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(col.renderCell({ row })).toBe('translated(reviewerType.both)');
    });

    it('renders empty string', () => {
      const row = { ...baseRow, isScience: false, isTechnical: false };
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(col.renderCell({ row })).toBe('');
    });

    it('has renderHeader', () => {
      const col = getColReviewerType(t, 'all', mockSetType);
      expect(typeof col.renderHeader).toBe('function');
    });
  });

  describe('getColSubExpertise', () => {
    it('renders subExpertise', () => {
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row: baseRow })).toBe(
        'translated(reviewers.subExpertiseCategory.radio)'
      );
    });

    it('handles undefined', () => {
      const row = { ...baseRow, subExpertise: undefined };
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.subExpertiseCategory.undefined)');
    });

    it('handles null', () => {
      const row = { ...baseRow, subExpertise: null };
      const col = getColSubExpertise(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.subExpertiseCategory.null)');
    });
  });

  describe('getColStatus', () => {
    it('renders status', () => {
      const col = getColStatus(t);
      expect(col.renderCell({ row: baseRow })).toBe('translated(reviewers.statusCategory.active)');
    });

    it('handles undefined', () => {
      const row = { ...baseRow, status: undefined };
      const col = getColStatus(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.statusCategory.notSpecified)');
    });

    it('handles null', () => {
      const row = { ...baseRow, status: null };
      const col = getColStatus(t);
      expect(col.renderCell({ row })).toBe('translated(reviewers.statusCategory.notSpecified)');
    });
  });
});
