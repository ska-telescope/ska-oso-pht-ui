import Target from '../types/target';

const updateProposal = (
  targets: any,
  targetObservations: any,
  calibrationStrategy: any,
  dataProductsSDP: any,
  observations: any,
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
  // filter out calibrationStrategy entries from associated targetObservation
  const obsId = getProposal().targetObservation?.find(e => e.targetId === target?.id)
    ?.observationId;
  const calibrationStrategy =
    getProposal().calibrationStrategy?.[0] !== undefined
      ? getProposal().calibrationStrategy.filter(e => e.observationIdRef !== obsId)
      : undefined;
  const dataProductsSDP = getProposal().dataProductSDP.filter(e => e.observationId !== obsId);
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
