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
  dec: number;
  dec_unit: string;
  id: number;
  name: string;
  ra: number;
  ra_unit: string;
  vel: number;
  vel_unit: string;
};

export default Target;
