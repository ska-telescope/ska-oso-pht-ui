import type { ProposalFixture, Target } from '../../types';

// Values shared by the SV proposal fixtures.

// Uploaded on the Description page, from tests/cypress/fixtures
export const DESCRIPTION: ProposalFixture['description'] = {
  document: 'testFile.pdf'
};

// Targets have their RA and Dec typed in. They're also the values the resolver is expected to fill
// in when the Target page spec resolves the target by name.
export const PKS_1830_211: Target = {
  name: 'PKS 1830-211',
  coordinateType: 'ICRS',
  ra: '18:33:39.9399',
  dec: '-21:03:39.369',
  velocityType: 'Redshift',
  redshift: '2.507'
};
