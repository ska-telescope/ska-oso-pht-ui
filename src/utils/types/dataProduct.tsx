import { ValueUnitPair } from './valueUnitPair';

export type DataProductSDPsBackend = {
  data_product_id: string;
  products: string[];
  observation_set_refs: string[];
  script_parameters: {
    image_size: ValueUnitPair;
    image_cellsize?: ValueUnitPair;
    weight: {
      weighting?: string;
      robust?: number;
    };
    polarisations?: string;
    channels_out?: number;
    fit_spectral_pol?: number;
  };
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
  pixelSizeUnits: string;
  weighting: number;
  robust: number;
  polarisations: string;
  channelsOut: number;
  fitSpectralPol: number;
};

export type DataProductSRC = {
  id: string;
};
