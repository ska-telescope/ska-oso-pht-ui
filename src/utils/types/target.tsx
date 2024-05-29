export type TargetBackend = {
  declination: string;
  declination_unit: string;
  name: string;
  right_ascension: string;
  right_ascension_unit: string;
  velocity: string;
  velocity_unit: string;
};

/** **********************************************************************************
 *  NOTE : raUnit & decUnit are currently mapped as follows:
 *   '0' : values are Right Ascension & Declination
 *   "1" : values are Latitude & Longitude.
 ********************************************************************************** */

/** **********************************************************************************
 *  NOTE : velUnit is currently mapped as follows:
 *   ''  : No units
 *   '0' : "km/s"
 *   '1' : "m/s"
 ********************************************************************************** */

type Target = {
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
  vel: string;
  velUnit: string;
};

export default Target;
