import Observation from '@utils/types/observation.tsx';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_TYPE_INTEGRATION,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';

export const mockObservation: Observation = {
  ...DEFAULT_CONTINUUM_OBSERVATION_LOW,
  id: 'obs-1',
  telescope: TELESCOPE_LOW_NUM,
  supplied: {
    type: SUPPLIED_TYPE_INTEGRATION,
    value: 1,
    units: SUPPLIED_INTEGRATION_TIME_UNITS_H
  }
};
