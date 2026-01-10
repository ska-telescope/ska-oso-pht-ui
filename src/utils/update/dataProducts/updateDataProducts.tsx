import { DataProductSDP } from '../../types/dataProduct';

export const updateDataProducts = (oldRecs: DataProductSDP[], newRec: DataProductSDP) => {
  const newDataProducts: DataProductSDP[] = [];
  if (oldRecs && oldRecs?.length > 0) {
    oldRecs.forEach(inValue => {
      newDataProducts.push(inValue.id === newRec.id ? newRec : inValue);
    });
  } else {
    newDataProducts.push(newRec);
  }
  console.log('updated data products', newDataProducts);
  return newDataProducts;
};
export default updateDataProducts;
