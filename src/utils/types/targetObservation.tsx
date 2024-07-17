import { SensCalcResult } from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';

type TargetObservation = {
  targetId: string;
  observationId: string;
  sensCalc: SensCalcResult;
};

export default TargetObservation;
