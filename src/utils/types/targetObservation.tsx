import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: string;
  observationId: string;
  dataProductsSDPId: string;
  sensCalc?: SensCalcResults;
};

export default TargetObservation;
