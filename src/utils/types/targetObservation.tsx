import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: number;
  observationId: string;
  dataProductsSDPId: string;
  sensCalc: SensCalcResults;
};

export default TargetObservation;
