import Observation from '../../types/observation';

export const updateObservations = (oldRecs: Observation[], newRec: Observation) => {
  const newObservations: Observation[] = [];
  if (oldRecs && oldRecs?.length > 0) {
    oldRecs.forEach(inValue => {
      newObservations.push(inValue.id === newRec.id ? newRec : inValue);
    });
  } else {
    newObservations.push(newRec);
  }
  return newObservations;
};
export default updateObservations;
