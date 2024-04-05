import SensitivityCalculatorResults from './sensitivityCalculatorResults';

type TargetObservation = {
  targetId: number;
  observationId: number;
  sensitivityCalculatorResults?: SensitivityCalculatorResults;
};

export default TargetObservation;
