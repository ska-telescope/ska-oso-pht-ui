import { describe, expect, test } from 'vitest';
import { getDataProductScriptParameters } from '@services/axios/put/putProposal/putProposalMapping';
import { mapping } from '@services/axios/get/getProposal/getProposal';
import type { DataProductSDP } from '@/generated/models';
import { MockSlicesPdm } from './testing/mockSlicesPdm';
import { legacyObservations, pdmDataProducts } from './testing/pdmDataProducts';
import {
  DATA_PRODUCT_KIND,
  dataProductFromPdm,
  dataProductsFromPdm,
  dataProductToPdm,
  dataProductsToPdm,
  getDataProductsSchema,
  getDataProductSchema
} from './dataProducts';

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
