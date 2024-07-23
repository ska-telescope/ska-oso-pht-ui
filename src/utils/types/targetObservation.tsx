import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: number;
  observationId: string;
  sensCalc: SensCalcResults;
};

export default TargetObservation;
