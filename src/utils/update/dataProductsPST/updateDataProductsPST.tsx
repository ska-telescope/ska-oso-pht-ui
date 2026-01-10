import { DataProductSDP } from '../../types/dataProduct';
import { DEFAULT_DATA_PRODUCT, TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';

export const updateDataProductsPST = (oldRecs: DataProductSDP[], newRec: Observation) => {
  const newDataProducts: DataProductSDP[] = [];
  if (newRec.type === TYPE_PST) {
    const tmpRec: DataProductSDP = {
      ...DEFAULT_DATA_PRODUCT,
      observationId: newRec.id,
      dataProductType: newRec.pstMode ?? 0
    };
    if (oldRecs && oldRecs?.length > 0) {
      oldRecs.forEach(inValue => {
        newDataProducts.push(
          inValue.observationId === newRec.id && newRec?.pstMode !== inValue.dataProductType
            ? tmpRec
            : inValue
        );
      });
    }
  } else {
    newDataProducts.push(...(oldRecs ?? []));
  }
  console.log('updated data products pst', newDataProducts);
  console.log('obs', newRec);
  console.log('oldRecs', oldRecs);
  return newDataProducts;
};
export default updateDataProductsPST;
