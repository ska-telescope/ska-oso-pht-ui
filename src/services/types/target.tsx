export type TargetBackend = {
  declination: number;
  declination_unit: string;
  name: string;
  right_ascension: number;
  right_ascension_unit: string;
  velocity: number;
  velocity_unit: string;
};

/************************************************************************************
 *  NOTE : raUnit & decUnit are currently mapped as follows:
 *   '0' : values are Right Ascension & Declination
 *   "1" : values are Latitude & Longitude.
 ***********************************************************************************/

/************************************************************************************
 *  NOTE : velUnit is currently mapped as follows:
 *   ''  : No units
 *   '0' : "km/s"
 ***********************************************************************************/

type Target = {
  dec: string;
  decUnit: string;
  id: number;
  name: string;
  ra: string;
  raUnit: string;
  referenceFrame: string;
  vel: string;
  velUnit: string;
};

export default Target;
