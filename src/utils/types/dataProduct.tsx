import { ValueUnitPair } from './valueUnitPair';

export type DataProductSDPsBackend = {
  data_product_id: string;
  options: string[];
  observation_set_refs: string[];
  image_size: ValueUnitPair;
  image_cellsize?: ValueUnitPair;
  weighting?: string;
  polarisations?: string;
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
  imageSizeUnits: number;
  pixelSizeValue: number;
  pixelSizeUnits: number;
  weighting: number;
  polarisations: string;
};

export type DataProductSRC = {
  id: string;
};
