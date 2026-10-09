/*
export type TargetBackend = {
  declination: string;
  declination_unit: string;
  name: string;
  right_ascension: string;
  right_ascension_unit: string;
  velocity: string;
  velocity_unit: string;
};
*/

import type { Target as TargetPDM } from '@/generated/models/target';
import type { ICRSCoordinates } from '@/generated/models/icrscoordinates';
import type { GalacticCoordinates } from '@/generated/models/galactic-coordinates';
import type { SpecialCoordinates } from '@/generated/models/special-coordinates';
import type { PointingPatternParameters } from '@/generated/models/pointing-pattern-parameters';

export type PointingPatternParamsBackend = PointingPatternParameters;

export type ReferenceCoordinateGalacticBackend = GalacticCoordinates;

// ICRS now replaces equatorial
export type ReferenceCoordinateICRSBackend = ICRSCoordinates;

// Solar System objects
export type ReferenceCoordinateSSOBackend = SpecialCoordinates;

export type TargetBackend = TargetPDM;

/************************************************************************************
 *  NOTE : coordinates are currently mapped as follows:
 *   '0' : values are Right Ascension & Declination
 *   "1" : values are Latitude & Longitude.
 ***********************************************************************************/

/************************************************************************************
 *  NOTE : velType is currently mapped as follows:
 "0": "Velocity",
 "1": "Redshift"
 ***********************************************************************************/

/************************************************************************************
 *  NOTE : velUnit is currently mapped as follows:
 *   ''  : No units
 *   '0' : "km/s"
 *   '1' : "m/s"
 ***********************************************************************************/

// NOT USED : Note that the fields marked as NOT USED should be removed until such time as they are actually needed

// NOT USED
export type PointingPatternParams = {
  kind: string;
  offsetXArcsec: number;
  offsetYArcsec: number;
};

export type ReferenceCoordinateGalactic = {
  kind: string;
  l: number; // replaces Galactic longitude
  b: number; // replaces Galactic latitude
  pmL?: number;
  pmB?: number;
  epoch?: number;
  parallax?: number;
};

export type ReferenceCoordinateICRS = {
  kind: string;
  raStr: string;
  decStr: string;
  pmRa?: number;
  pmDec?: number;
  parallax?: number;
  epoch?: number;
};

export type ReferenceCoordinateSSO = {
  kind: string;
};

export type Target = {
  id: string;
  name: string;
  redshift?: string;
  raReferenceFrame?: string; // NOT USED
  raDefinition?: string; // NOT USED
  velType?: number;
  vel?: string;
  velUnit?: number;
  /*------- reference coordinate properties --------------------- */
  kind: number; // for both ICRS, Galactic and SSO
  l?: number; // for Galactic
  b?: number; // for Galactic
  pmL?: number; // NOT USED YET // for Galactic
  pmB?: number; // NOT USED YET // for Galactic
  raStr?: string; // replaces ra for ICRS
  decStr?: string; // replaces dec for ICRS
  pmRa?: number; // NOT USED YET // for ICRS
  pmDec?: number; // NOT USED YET // for ICRS
  parallax?: number; // NOT USED YET // for both Galactic & ICRS
  epoch?: number; // NOT USED YET // for both Galactic & ICRS
  /*------- end of reference coordinate properties --------------------- */
  pointingPattern?: {
    // NOT USED
    active: string; // NOT USED
    parameters: PointingPatternParams[]; // NOT USED
  }; // NOT USED
};

export default Target;
