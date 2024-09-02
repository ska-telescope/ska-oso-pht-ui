import { ValueUnitPair } from './valueUnitPair';

export type DataProductSDPsBackend = {
  data_products_sdp_id: string;
  options: string[];
  observation_set_refs: string[];
  image_size: ValueUnitPair;
  pixel_size?: ValueUnitPair;
  weighting?: string;
};

export type DataProductSRCNetBackend = {
  data_products_src_id: string;
};

export type DataProductSDP = {
  id: number;
  dataProductsSDPId?: string;
  observatoryDataProduct: boolean[];
  observationId: string[];
  imageSizeValue: number;
  imageSizeUnits: string;
  pixelSizeValue: number;
  pixelSizeUnits: string;
  weighting: number;
};

export type DataProductSRC = {
  id: string;
};
