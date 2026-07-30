import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPTimingPSTData
} from '../../types/dataProduct';
import {
  AA2_LOW_LONGEST_BASELINE_M,
  AA2_LOW_STATION_DIAMETER_M,
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE,
  SPEED_OF_LIGHT,
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

export const updateDataProductsOnObservationChange = (
  currentDataProducts: DataProductSDPNew[],
  observation: Observation
) => {
  // This function handles updates to the data products based on changes to the observation.
  // It currently handles two cases:
  //   if the observation is of type PST, it creates the relevant data product for the PST mode.
  //   otherwise, it checks if there is an Images data product and updates the image size params based on the central frequency in the observation

  // Spread operator needed as read only store objects are being passed around..
  const newDataProducts: DataProductSDPNew[] = [...(currentDataProducts ?? [])];

  if (observation.type === TYPE_PST) {
    const dataProductForPstMode: DataProductSDPNew = {
      id: 'SDP-0000000',
      observationId: observation.id,
      data: PSTData(observation)
    };

    const pstDataProductIndex = newDataProducts.findIndex(
      (dataProduct) => dataProduct.observationId === observation.id
    );
    if (pstDataProductIndex != -1) {
      newDataProducts[pstDataProductIndex] = {
        ...dataProductForPstMode,
        id: newDataProducts[pstDataProductIndex].id
      };
    }
  } else {
    const imagesDataProductIndex = newDataProducts.findIndex(
      (dataProduct) =>
        dataProduct.observationId === observation.id &&
        dataProduct.data?.dataProductType == DP_TYPE_IMAGES
    );

    if (imagesDataProductIndex != -1) {
      const imagesDataProduct = currentDataProducts[imagesDataProductIndex];

      const newImagesDataProduct = updateImagesDataProductSizes(
        imagesDataProduct,
        observation.centralFrequency
      );

      newDataProducts[imagesDataProductIndex] = newImagesDataProduct;
    }
  }
  return newDataProducts;
};
export default updateDataProductsOnObservationChange;

export const updateImagesDataProductSizes = (
  imagesDataProduct: DataProductSDPNew,
  centralFrequencyMhz: number
): DataProductSDPNew => {
  if (!centralFrequencyMhz || centralFrequencyMhz <= 0) {
    return imagesDataProduct;
  }

  const centralWavelengthM = SPEED_OF_LIGHT / (centralFrequencyMhz * 1e6);
  const imageSizeDeg = (180 / Math.PI) * (centralWavelengthM / AA2_LOW_STATION_DIAMETER_M);
  const pixelSizeDeg =
    (3600 * (180 / Math.PI) * (centralWavelengthM / AA2_LOW_LONGEST_BASELINE_M)) / 3;
  const decimalPlaces = 1;
  return {
    ...imagesDataProduct,
    data: {
      ...imagesDataProduct?.data,
      imageSizeValue: Math.round(imageSizeDeg * 10 ** decimalPlaces) / 10 ** decimalPlaces,
      imageSizeUnits: 0,
      pixelSizeValue: Math.round(pixelSizeDeg * 10 ** decimalPlaces) / 10 ** decimalPlaces,
      pixelSizeUnits: 2
    }
  };
};
