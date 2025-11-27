import { DEFAULT_OBSERVATIONS_LOW_AA2 } from '../constants';

export const observationOut = (obsMode: number) => {
  const defaultObs = DEFAULT_OBSERVATIONS_LOW_AA2[obsMode];
  console.log('defaultObs', defaultObs);
  return defaultObs;
};
