import { STATUS_PARTIAL } from '@/utils/constants';
import Observation from '@/utils/types/observation';
import TargetObservation from '@/utils/types/targetObservation';

export const updateSensCalcPartial = (oldRecs: TargetObservation[], ob: Observation) => {
  const result = oldRecs?.map(rec => {
    if (rec.observationId === ob.id) {
      const to: TargetObservation = {
        observationId: rec.observationId,
        targetId: rec.targetId,
        sensCalc: {
          id: rec.targetId,
          title: '',
          statusGUI: STATUS_PARTIAL,
          error: ''
        },
        dataProductsSDPId: ''
      };
      return to;
    } else {
      return rec;
    }
  });
  return result;
};

export default updateSensCalcPartial;
