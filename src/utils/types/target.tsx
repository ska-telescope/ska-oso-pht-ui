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

export type TargetBackend = {
  target_id: string;
  name: string;
  pointing_pattern?: {
    active: string;
    parameters: PointingPatternParamsBackend[];
  };
  reference_coordinate: {
    kind: string;
    ra: number | string;
    dec: number | string;
    epoch?: number; // TODO check if this is a mandatory field
    unit: string[];
    reference_frame: string;
  };
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
  epoch?: number;
  dec: string;
  decUnit: string;
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  ra: string;
  raUnit: string;
  redshift: string;
  referenceFrame: number;
  rcReferenceFrame?: string; // NOT USED
  raReferenceFrame?: string; // NOT USED
  raDefinition?: string; // NOT USED
  velType: number;
  vel: string;
  velUnit: number;
  pointingPattern?: {
    // NOT USED
    active: string; // NOT USED
    parameters: PointingPatternParams[]; // NOT USED
  }; // NOT USED
};

export default Target;
