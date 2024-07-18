import { SensCalcResult } from '../../utils/types/result';

type TargetObservation = {
  targetId: string;
  observationId: string;
  sensCalc: SensCalcResult;
};

export default TargetObservation;
