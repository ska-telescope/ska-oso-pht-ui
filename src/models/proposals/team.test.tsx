import { describe, expect, test } from 'vitest';
import { getTeamSchema, getTeamValues, teamToPdm } from './team';
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

describe('team form model', () => {
  test('defaults to no investigators', () => {
    expect(getTeamSchema().parse({})).toEqual({ investigators: [] });
    expect(getTeamValues()).toEqual({ investigators: [] });
  });

  test('retains investigators from the proposal', () => {
    expect(getTeamValues({ investigators: [investigator] })).toEqual({
      investigators: [investigator]
    });
  });

  test('maps investigator form values to PDM fields', () => {
    expect(teamToPdm([investigator])).toEqual([
      {
        user_id: 'user-1',
        status: 'accepted',
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.org',
        organization: 'Analytical Engines',
        for_phd: false,
        principal_investigator: true,
        officeLocation: 'London',
        jobTitle: 'Researcher'
      }
    ]);
  });
});
