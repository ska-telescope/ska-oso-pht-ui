import Observation from '@utils/types/observation.tsx';
import {
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_TYPE_INTEGRATION,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';

export const mockObservation: Observation = {
  id: 'obs-1',
  telescope: TELESCOPE_LOW_NUM,
  supplied: {
    type: SUPPLIED_TYPE_INTEGRATION,
    value: 1,
    units: SUPPLIED_INTEGRATION_TIME_UNITS_H
  }
};
