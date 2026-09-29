import TargetObservation from '@utils/types/targetObservation.tsx';
import { CalibrationStrategy } from '@utils/types/calibrationStrategy.tsx';
import Target from '../types/target';

const updateProposal = (
  targets: Target[],
  targetObservations: TargetObservation[],
  calibrationStrategy: CalibrationStrategy[],
  getProposal: Function,
  setProposal: Function
) => {
  const updatedProposal = {
    ...getProposal(),
    targets: targets,
    targetObservation: targetObservations,
    calibrationStrategy: calibrationStrategy
  };
  setProposal(updatedProposal);
};

/**
 * Removes a target and its results and calibration strategy.
 */
export default async function deleteAutoLinking(
  target: Target,
  getProposal: Function,
  setProposal: Function
) {
  const targets = getProposal().targets?.filter((e: Target) => e.id !== target?.id);
  // filter out targetObservation entries linked to deleted target
  const targetObservations = getProposal().targetObservation?.filter(
    (e: TargetObservation) => e.targetId !== target?.id
  );
  // filter out calibrationStrategy entry from associated targetObservation
  const obsId = getProposal().targetObservation?.find(
    (e: TargetObservation) => e.targetId === target?.id
  )?.observationId;
  const calibrationStrategy =
    getProposal().calibrationStrategy?.[0] !== undefined
      ? getProposal().calibrationStrategy.filter(
          (e: CalibrationStrategy) => e.observationIdRef !== obsId
        )
      : undefined;

  updateProposal(targets, targetObservations, calibrationStrategy, getProposal, setProposal);
}
