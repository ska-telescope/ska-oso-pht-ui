import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPTimingPSTData
} from '../../types/dataProduct';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE,
  TYPE_PST
} from '@/utils/constants';
import Observation from '@/utils/types/observation';

export const PSTData = (
  observation: Observation
): SDPFilterbankPSTData | SDPTimingPSTData | SDPFlowthroughPSTData => {
  switch (observation.pstMode) {
    case PULSAR_TIMING_VALUE:
      return {
        dataProductType: PULSAR_TIMING_VALUE
      } as SDPTimingPSTData;
    case DETECTED_FILTER_BANK_VALUE:
      return {
        dataProductType: DETECTED_FILTER_BANK_VALUE,
        polarisations: ['I'],
        outputFrequencyResolution: 1,
        outputSamplingInterval: 1,
        bitDepth: 1,
        dispersionMeasure: 1,
        rotationMeasure: 1
      } as SDPFilterbankPSTData;
    default:
      return {
        dataProductType: FLOW_THROUGH_VALUE,
        polarisations: ['X'],
        bitDepth: 1
      } as SDPFlowthroughPSTData;
  }
};

export const updateDataProductsPST = (oldRecs: DataProductSDPNew[], newRec: Observation) => {
  const newDataProducts: DataProductSDPNew[] = [];
  if (newRec.type === TYPE_PST) {
    const tmpRec: DataProductSDPNew = {
      id: 'SDP-0000000',
      observationId: newRec.id,
      data: PSTData(newRec)
    };
    if (oldRecs && oldRecs?.length > 0) {
      oldRecs.forEach(inValue => {
        newDataProducts.push(
          inValue.observationId === newRec.id &&
            newRec?.pstMode !==
              (inValue?.data as SDPFilterbankPSTData | SDPTimingPSTData | SDPFlowthroughPSTData)
                ?.dataProductType
            ? tmpRec
            : inValue
        );
      });
    }
  } else {
    newDataProducts.push(...(oldRecs ?? []));
  }
  return newDataProducts;
};
export default updateDataProductsPST;
