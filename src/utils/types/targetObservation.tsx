import { SensCalcResult } from '../../services/axios/sensitivityCalculator/getSensitivityCalculatorAPIData';

type TargetObservation = {
  targetId: number;
  observationId: string;
  sensCalc: SensCalcResult;
};

export default TargetObservation;
