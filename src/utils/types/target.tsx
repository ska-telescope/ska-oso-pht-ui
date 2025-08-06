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

import { ValueUnitPair } from './valueUnitPair';

export type PointingPatternParamsBackend = {
  kind: string;
  offset_x_arcsec: number;
  offset_y_arcsec: number;
};

export type ReferenceCoordinateGalacticBackend = {
  kind: string;
  l: number;
  b: number;
  pm_l?: number;
  pm_b?: number;
  epoch?: number;
  parallax?: number;
};

// this replaces equatorial
export type ReferenceCoordinateICRSBackend = {
  kind: string;
  reference_frame: string;
  ra_str: string;
  dec_str: string;
  pm_ra?: number;
  pm_dec?: number;
  parallax?: number;
  epoch?: number;
};

export type TargetBackend = {
  target_id: string;
  name: string;
  pointing_pattern?: {
    active: string;
    parameters: PointingPatternParamsBackend[];
  };
  reference_coordinate: ReferenceCoordinateICRSBackend | ReferenceCoordinateGalacticBackend;
  radial_velocity: {
    quantity: ValueUnitPair;
    definition: string;
    reference_frame: string;
    redshift: number;
  };
};

/************************************************************************************
 *  NOTE : raUnit & decUnit are currently mapped as follows:
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

type Target = {
  id: number;
  name: string;
  redshift: string;
  raReferenceFrame?: string; // NOT USED
  raDefinition?: string; // NOT USED
  velType: number;
  vel: string;
  velUnit: number;
  /*------- reference coordinate properties --------------------- */
  kind: string; // for both ICRS and Galactic
  l?: number; // NOT USED YET replaces longitude // for Galactic
  b?: number; // NOT USED YET replaces latitude // for Galactic
  pmL?: number; // NOT USED YET // for Galactic
  pmB?: number; // NOT USED YET // for Galactic
  referenceFrame?: string; // for ICRS
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
