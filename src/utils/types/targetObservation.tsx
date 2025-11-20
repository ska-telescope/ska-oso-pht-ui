import { SensCalcResults } from '../../utils/types/sensCalcResults';

type TargetObservation = {
  targetId: number;
  observationId: string;
  dataProductsSDPId: string; // TODO make data product mandatory once used for sens calc results
  sensCalc: SensCalcResults;
};

export default TargetObservation;
