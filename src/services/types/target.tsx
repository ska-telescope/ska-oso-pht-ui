export type TargetBackend = {
  declination: number;
  declination_unit: string;
  name: string;
  right_ascension: number;
  right_ascension_unit: string;
  velocity: number;
  velocity_unit: string;
};

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
