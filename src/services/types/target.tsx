export type TargetIN = {
  name: string;
  right_ascension: string;
  declination: string;
  velocity: number;
  velocity_unit: string;
  right_ascension_unit: string;
  declination_unit: string;
};

type Target = {
  id: number;
  name: string;
  ra: string;
  dec: string;
  vel: string;
};

export default Target;
