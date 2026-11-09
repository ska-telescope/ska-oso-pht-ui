import { describe, expect, test } from 'vitest';
import { getDataProductScriptParameters } from '@services/axios/put/putProposal/putProposalMapping';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import Observation from '@utils/types/observation';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '@utils/constants';
import type { ContinuumImage, DataProductSDP } from '@/generated/models';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import {
  DATA_PRODUCT_KIND,
  dataProductFromPdm,
  dataProductsFromPdm,
  dataProductToPdm,
  dataProductsToPdm,
  getDataProductsSchema,
  getDataProductSchema
} from './dataProducts';

// One data product of every script variant, as the backend sends them
const image: Pick<
  ContinuumImage,
  'image_size' | 'image_cellsize' | 'weight' | 'polarisations' | 'gaussian_taper'
> = {
  image_size: { value: 2.2, unit: 'deg' },
  image_cellsize: { value: 1.3, unit: 'arcsec' },
  weight: { weighting: 'briggs', robust: 0.5 },
  polarisations: ['I', 'XX'],
  gaussian_taper: 0
};

const pdmDataProducts: DataProductSDP[] = [
  {
    data_product_id: 'dp-continuum-image',
    observation_set_ref: 'obs-continuum',
    script_parameters: {
      ...image,
      channels_out: 1,
      kind: 'continuum',
      variant: 'continuum image'
    }
  },
  {
    data_product_id: 'dp-continuum-visibilities',
    observation_set_ref: 'obs-continuum',
    script_parameters: {
      time_averaging: 2,
      frequency_averaging: 3,
      kind: 'continuum',
      variant: 'visibilities'
    }
  },
  {
    data_product_id: 'dp-spectral-image',
    observation_set_ref: 'obs-spectral',
    script_parameters: {
      ...image,
      weight: { weighting: 'uniform' },
      channels_out: 40,
      continuum_subtraction: true,
      kind: 'spectral',
      variant: 'spectral image'
    }
  },
  {
    data_product_id: 'dp-continuum-spectral-image',
    observation_set_ref: 'obs-continuum-spectral',
    script_parameters: {
      ...image,
      channels_out: 4000,
      kind: 'continuum and spectral line',
      variant: 'continuum and spectral line image'
    }
  },
  {
    data_product_id: 'dp-pst-flow-through',
    observation_set_ref: 'obs-pst-flow-through',
    script_parameters: {
      polarisations: ['X', 'Y'],
      bit_depth: 16,
      kind: 'pst',
      variant: 'flow through'
    }
  },
  {
    data_product_id: 'dp-pst-detected-filterbank',
    observation_set_ref: 'obs-pst-detected-filterbank',
    script_parameters: {
      polarisations: ['I'],
      bit_depth: 8,
      output_frequency_resolution: 1,
      output_sampling_interval: 2,
      dispersion_measure: 3.5,
      rotation_measure: -4,
      kind: 'pst',
      variant: 'detected filterbank'
    }
  },
  {
    data_product_id: 'dp-pst-timing',
    observation_set_ref: 'obs-pst-timing',
    script_parameters: { kind: 'pst', variant: 'pulsar timing' }
  }
];

// The legacy save picks a data product's script variant from its observation's type and PST mode
const legacyObservations = [
  { id: 'obs-continuum', type: TYPE_CONTINUUM },
  { id: 'obs-spectral', type: TYPE_ZOOM },
  { id: 'obs-continuum-spectral', type: TYPE_CONTINUUM_SPECTRAL },
  { id: 'obs-pst-flow-through', type: TYPE_PST, pstMode: FLOW_THROUGH_VALUE },
  { id: 'obs-pst-detected-filterbank', type: TYPE_PST, pstMode: DETECTED_FILTER_BANK_VALUE },
  { id: 'obs-pst-timing', type: TYPE_PST, pstMode: PULSAR_TIMING_VALUE }
] as Observation[];

const continuumImage = dataProductFromPdm(pdmDataProducts[0]);

describe('data product PDM mapping', () => {
  test('gives every script variant its kind', () => {
    expect(dataProductsFromPdm(pdmDataProducts).map((dp) => dp.kind)).toEqual([
      DATA_PRODUCT_KIND.CONTINUUM_IMAGE,
      DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
      DATA_PRODUCT_KIND.SPECTRAL_IMAGE,
      DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE,
      DATA_PRODUCT_KIND.PST_FLOW_THROUGH,
      DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK,
      DATA_PRODUCT_KIND.PST_TIMING
    ]);
  });

  test('round-trips every script variant: PDM → form → PDM', () => {
    // Only a valid data product is sent, so it goes through the schema as on a save
    const dataProducts = getDataProductsSchema().parse(dataProductsFromPdm(pdmDataProducts));
    expect(dataProductsToPdm(dataProducts)).toEqual(pdmDataProducts);
  });

  test('loads a missing data product list as empty', () => {
    expect(dataProductsFromPdm(undefined)).toEqual([]);
  });

  test('loads the image fields', () => {
    expect(continuumImage).toEqual({
      id: 'dp-continuum-image',
      observationId: 'obs-continuum',
      kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE,
      imageSize: { value: 2.2, unit: 'deg' },
      pixelSize: { value: 1.3, unit: 'arcsec' },
      weighting: 'briggs',
      robust: 0.5,
      taper: 0,
      polarisations: ['I', 'XX'],
      channelsOut: 1
    });
  });

  test('defaults the fields the PDM makes optional', () => {
    const dp = dataProductFromPdm({
      ...pdmDataProducts[2],
      script_parameters: {
        image_size: { value: 2.2 },
        image_cellsize: { value: 1.3 },
        weight: { weighting: 'natural' },
        polarisations: ['I'],
        channels_out: 2,
        continuum_subtraction: false,
        variant: 'spectral image'
      }
    });
    expect(dp).toMatchObject({ robust: 0, taper: 0 });
  });

  test('leaves a missing or unknown unit unchosen', () => {
    const dp = dataProductFromPdm({
      ...pdmDataProducts[0],
      script_parameters: {
        ...pdmDataProducts[0].script_parameters,
        image_size: { value: 2.2 },
        image_cellsize: { value: 1.3, unit: 'arcsecs' }
      } as DataProductSDP['script_parameters']
    });
    expect(dp).toMatchObject({
      imageSize: { value: 2.2, unit: null },
      pixelSize: { value: 1.3, unit: null }
    });
    expect(getDataProductSchema().safeParse(dp).success).toBe(false);
  });

  test('sends robust only for briggs weighting', () => {
    const natural = dataProductToPdm(
      getDataProductSchema().parse({ ...continuumImage, weighting: 'natural' })
    );
    expect(natural.script_parameters).toMatchObject({ weight: { weighting: 'natural' } });
    expect(natural.script_parameters).not.toHaveProperty('weight.robust');
  });

  test.each(pdmDataProducts.map((dp) => [dp.script_parameters.variant, dp] as const))(
    'saves %s as the legacy save does',
    (_, pdmDataProduct) => {
      const [legacyDataProduct] = mapping({
        ...MockSlicesPdm,
        observation_info: { ...MockSlicesPdm.observation_info, data_product_sdps: [pdmDataProduct] }
      }).dataProductSDP!;
      const dataProduct = dataProductToPdm(
        getDataProductSchema().parse(dataProductFromPdm(pdmDataProduct))
      );

      expect(dataProduct.script_parameters).toEqual(
        getDataProductScriptParameters(legacyObservations, legacyDataProduct)
      );
    }
  );
});

describe('data product schema', () => {
  const schema = getDataProductSchema();
  const valid = (dp: object) => schema.safeParse(dp).success;

  test.each(dataProductsFromPdm(pdmDataProducts).map((dp) => [dp.kind, dp] as const))(
    'accepts a valid %s data product',
    (_, dp) => {
      expect(valid(dp)).toBe(true);
    }
  );

  test('rejects an unknown kind', () => {
    expect(valid({ ...continuumImage, kind: 'images' })).toBe(false);
  });

  test('rejects a data product without its kind fields', () => {
    expect(valid({ id: 'dp', observationId: 'obs', kind: DATA_PRODUCT_KIND.CONTINUUM_IMAGE })).toBe(
      false
    );
  });

  test.each([
    ['an image size of zero', { imageSize: { value: 0, unit: 'deg' } }],
    ['a negative pixel size', { pixelSize: { value: -1, unit: 'arcsec' } }],
    ['an unknown unit', { imageSize: { value: 1, unit: 'rad' } }],
    ['no unit', { pixelSize: { value: 1, unit: null } }],
    ['an unknown weighting', { weighting: 'robust' }],
    ['a robust above 2', { robust: 2.5 }],
    ['a negative taper', { taper: -1 }],
    ['no polarisations', { polarisations: [] }],
    ['an unknown polarisation', { polarisations: ['Z'] }]
  ])('rejects an image with %s', (_, change) => {
    expect(valid({ ...continuumImage, ...change })).toBe(false);
  });

  // The limits follow the observation type the kind belongs to
  test.each([
    [DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 1, 40],
    [DATA_PRODUCT_KIND.SPECTRAL_IMAGE, 2, 40],
    [DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE, 2, 4000]
  ])('limits the channels out of a %s to %i–%i', (kind, min, max) => {
    const dp = { ...continuumImage, kind, continuumSubtraction: false };
    expect(valid({ ...dp, channelsOut: min })).toBe(true);
    expect(valid({ ...dp, channelsOut: max })).toBe(true);
    expect(valid({ ...dp, channelsOut: min - 1 })).toBe(false);
    expect(valid({ ...dp, channelsOut: max + 1 })).toBe(false);
    expect(valid({ ...dp, channelsOut: min + 0.5 })).toBe(false);
  });

  test('allows a bit depth of 16 for flow through but not for detected filterbank', () => {
    const [flowThrough, filterbank] = dataProductsFromPdm(pdmDataProducts.slice(4, 6));
    expect(valid({ ...flowThrough, bitDepth: 16 })).toBe(true);
    expect(valid({ ...filterbank, bitDepth: 16 })).toBe(false);
    expect(valid({ ...flowThrough, bitDepth: 3 })).toBe(false);
  });

  test('rejects visibilities averaging below 1', () => {
    const visibilities = dataProductFromPdm(pdmDataProducts[1]);
    expect(valid({ ...visibilities, timeAveraging: 0 })).toBe(false);
    expect(valid({ ...visibilities, frequencyAveraging: 0 })).toBe(false);
  });
});
