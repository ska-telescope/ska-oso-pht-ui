import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: string;
  observationId: string;
  sensCalc: SensCalcResults;
};

export default TargetObservation;
