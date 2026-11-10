import { describe, expect, test } from 'vitest';
import { getTeamSchema, getTeamValues, teamFromPdm, teamToPdm } from './team';
import Investigator from '@/utils/types/investigator';

const investigator: Investigator = {
  id: 'user-1',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.org',
  phdThesis: false,
  status: 'accepted',
  pi: true
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
  for_phd: investigator.phdThesis,
  principal_investigator: investigator.pi
};

describe('team form model', () => {
  test('maps backend investigators into form values', () => {
    expect(teamFromPdm([backendInvestigator])).toEqual({ investigators: [formInvestigator] });
  });

  test.each([undefined, null, []])(
    'defaults missing backend investigators: %s',
    (investigators) => {
      expect(teamFromPdm(investigators)).toEqual({ investigators: [] });
    }
  );

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

  test('maps edited investigator fields to PDM', () => {
    expect(teamToPdm([{ ...formInvestigator, firstName: 'Edited' }])).toEqual([
      { ...backendInvestigator, given_name: 'Edited' }
    ]);
  });

  test('drops unused organization data when loading and saving investigators', () => {
    const form = teamFromPdm([{ ...backendInvestigator, organization: 'Unused institute' }]);
    expect(form.investigators).toEqual([formInvestigator]);
    expect(teamToPdm(form.investigators)).toEqual([backendInvestigator]);
  });

  test('maps the current members in form order, including new members', () => {
    const result = teamToPdm([
      { ...formInvestigator, id: 'user-2' },
      formInvestigator,
      { ...formInvestigator, id: 'new' }
    ]);
    expect(result.map(({ user_id }) => user_id)).toEqual(['user-2', 'user-1', 'new']);
    expect(result[1]).toEqual(backendInvestigator);
    expect(result[2]).toEqual({
      ...backendInvestigator,
      user_id: 'new'
    });
  });
});
