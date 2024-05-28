export type DataProductSDPsBackend = {
  data_products_sdp_id: string;
  options: string[];
  observation_set_refs: string[];
  pixel_size: string;
  weighting: string;
};

export type DataProductSRCNetBackend = {
  data_products_src_id: string;
};

type DataProduct = {
  id: number;
  observatoryDataProduct: boolean[];
  observations: string;
  imageSize: string;
  pixelSize: string;
  weighting: string;
};

export default DataProduct;
