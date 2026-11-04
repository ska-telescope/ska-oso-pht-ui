import { describe, expect, test } from 'vitest';
import { getTeamSchema, getTeamValues, mergeTeamInvestigators, teamToPdm } from './team';
import Investigator from '@/utils/types/investigator';

const investigator: Investigator = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.org',
  affiliation: 'Analytical Engines',
  phdThesis: false,
  status: 'accepted',
  pi: true,
  officeLocation: 'London',
  jobTitle: 'Researcher'
};
const formInvestigator = {
  id: investigator.id,
  firstName: investigator.firstName,
  lastName: investigator.lastName,
  email: investigator.email,
  phdThesis: investigator.phdThesis,
  status: investigator.status,
  pi: investigator.pi
};
const backendInvestigator = {
  user_id: investigator.id,
  status: investigator.status,
  given_name: investigator.firstName,
  family_name: investigator.lastName,
  email: investigator.email,
  organization: investigator.affiliation,
  for_phd: investigator.phdThesis,
  principal_investigator: investigator.pi,
  officeLocation: investigator.officeLocation,
  jobTitle: investigator.jobTitle
};

describe('team form model', () => {
  test('defaults to no investigators', () => {
    expect(getTeamSchema().parse({})).toEqual({ investigators: [] });
    expect(getTeamValues()).toEqual({ investigators: [] });
  });

  test('keeps only editable investigator fields in the form', () => {
    expect(getTeamValues({ investigators: [investigator] })).toEqual({
      investigators: [formInvestigator]
    });
    expect(getTeamSchema().parse({ investigators: [investigator] })).toEqual({
      investigators: [formInvestigator]
    });
  });

  test('preserves metadata while applying edits to an existing PDM investigator', () => {
    expect(
      teamToPdm([{ ...formInvestigator, firstName: 'Edited' }], [backendInvestigator])
    ).toEqual([{ ...backendInvestigator, given_name: 'Edited' }]);
  });

  test('preserves metadata by ID when members are reordered, added, or removed', () => {
    const second = { ...backendInvestigator, user_id: 'user-2', organization: 'Second institute' };
    const removed = { ...backendInvestigator, user_id: 'removed' };
    const existing = [backendInvestigator, second, removed];
    const snapshot = structuredClone(existing);
    const result = teamToPdm(
      [{ ...formInvestigator, id: 'user-2' }, formInvestigator, { ...formInvestigator, id: 'new' }],
      existing
    );
    expect(result.map(({ user_id }) => user_id)).toEqual(['user-2', 'user-1', 'new']);
    expect(result[0].organization).toBe('Second institute');
    expect(result[1]).toEqual(backendInvestigator);
    expect(result[2]).toEqual({
      ...backendInvestigator,
      user_id: 'new',
      organization: '',
      officeLocation: null,
      jobTitle: null
    });
    expect(existing).toEqual(snapshot);
  });

  test('merges form edits into legacy records without leaking metadata back into the form', () => {
    const newMember = { ...formInvestigator, id: 'new' };
    const result = mergeTeamInvestigators(
      [{ ...formInvestigator, firstName: 'Edited' }, newMember],
      [investigator, { ...investigator, id: 'removed' }]
    );
    expect(result).toEqual([
      { ...investigator, firstName: 'Edited' },
      { ...newMember, affiliation: '', officeLocation: null, jobTitle: null }
    ]);
    expect(getTeamValues({ investigators: result }).investigators).toEqual([
      { ...formInvestigator, firstName: 'Edited' },
      newMember
    ]);
    expect(investigator.firstName).toBe('Ada');
  });
});
