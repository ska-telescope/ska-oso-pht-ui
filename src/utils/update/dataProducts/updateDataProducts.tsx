import { DataProductSDPNew } from '../../types/dataProduct';

export const updateDataProducts = (oldRecs: DataProductSDPNew[], newRec: DataProductSDPNew) => {
  const newDataProducts: DataProductSDPNew[] = [];
  if (oldRecs && oldRecs?.length > 0) {
    oldRecs.forEach(inValue => {
      newDataProducts.push(inValue.id === newRec.id ? newRec : inValue);
    });
  } else {
    newDataProducts.push(newRec);
  }
  return newDataProducts;
};
export default updateDataProducts;
