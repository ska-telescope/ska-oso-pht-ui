import type { ProposalFixture, Target } from '../../types';

// Values shared by the SV proposal fixtures.

// Uploaded on the Description page, from tests/cypress/fixtures
export const DESCRIPTION: ProposalFixture['description'] = {
  document: 'testFile.pdf'
};

// Targets are resolved by name through the backend. The RA and Dec are
// the values the resolver is expected to fill in, not typed by the test.
export const PKS_1830_211: Target = {
  name: 'PKS 1830-211',
  coordinateType: 'ICRS',
  ra: '18:33:39.9399',
  dec: '-21:03:39.369',
  velocityType: 'Redshift',
  redshift: '2.507'
};
