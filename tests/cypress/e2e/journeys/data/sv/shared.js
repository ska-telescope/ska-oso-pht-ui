// Values shared by the SV proposal fixtures.

// Uploaded on the Description page, from tests/cypress/fixtures
export const DESCRIPTION = {
  document: 'testFile.pdf'
};

// Targets are entered by hand rather than resolved, so the tests don't depend on SIMBAD/NED
export const PKS_1830_211 = {
  name: 'PKS 1830-211',
  coordinateType: 'ICRS',
  ra: '18:33:39.9399',
  dec: '-21:03:39.369',
  velocityType: 'Redshift',
  redshift: '2.507'
};
