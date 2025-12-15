import TargetObservation from '@utils/types/targetObservation.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import { DataProductSDP } from '@utils/types/dataProduct.tsx';
import Observation from '@utils/types/observation.tsx';
import Target from '../types/target';

const updateProposal = (
  targets: Target[],
  targetObservations: TargetObservation[],
  calibrationStrategy: CalibrationStrategy[],
  dataProductsSDP: DataProductSDP[],
  observations: Observation[],
  getProposal: Function,
  setProposal: Function
) => {
  const updatedProposal = {
    ...getProposal(),
    targets: targets,
    observations: observations,
    dataProductSDP: dataProductsSDP,
    targetObservation: targetObservations,
    calibrationStrategy: calibrationStrategy
  };
  setProposal(updatedProposal);
};

export default async function deleteAutoLinking(
  target: Target,
  getProposal: Function,
  setProposal: Function
) {
  const targets = getProposal().targets?.filter(e => e.id !== target?.id);
  // filter out targetObservation entries linked to deleted target
  const targetObservations = getProposal().targetObservation?.filter(
    e => e.targetId !== target?.id
  );
  // filter out calibrationStrategy entry from associated targetObservation
  const obsId = getProposal().targetObservation?.find(e => e.targetId === target?.id)
    ?.observationId;
  const calibrationStrategy =
    getProposal().calibrationStrategy?.[0] !== undefined
      ? getProposal().calibrationStrategy.filter(e => e.observationIdRef !== obsId)
      : undefined;
  // filter out data product entry from associated targetObservation
  const dataProductsSDP = getProposal().dataProductSDP.filter(e => e.observationId !== obsId);
  // filter out observation entry from associated targetObservation
  const observations = getProposal().observations.filter(e => e.id !== obsId);

  updateProposal(
    targets,
    targetObservations,
    calibrationStrategy,
    dataProductsSDP,
    observations,
    getProposal,
    setProposal
  );
}
