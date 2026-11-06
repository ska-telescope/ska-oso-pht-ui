import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: string;
  observationId: string;
  dataProductsSDPId: string;
  sensitivityResults?: SensCalcResults;
};

export default TargetObservation;
