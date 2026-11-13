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
  getDataProductSchema,
  newDataProduct,
  pstDataProductKind,
  STEPPED_FIELD,
  steppedToPdm,
  updateImageSizes
} from './dataProducts';
import phtTranslations from '../../../public/locales/en/pht.json';
import {
  DETECTED_FILTER_BANK_VALUE,
  FLOW_THROUGH_VALUE,
  PULSAR_TIMING_VALUE
} from '@utils/constants';

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
      weighting: { type: 'briggs', robust: 0.5 },
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
    expect(dp).toMatchObject({ weighting: { type: 'natural' }, taper: 0 });
  });

  test('gives briggs without a robust the default, and drops a robust sent with another weighting', () => {
    const withWeight = (weight: object) =>
      dataProductFromPdm({
        ...pdmDataProducts[0],
        script_parameters: { ...pdmDataProducts[0].script_parameters, weight }
      } as DataProductSDP);
    expect(withWeight({ weighting: 'briggs' })).toMatchObject({
      weighting: { type: 'briggs', robust: 0 }
    });
    expect(withWeight({ weighting: 'uniform', robust: 1 })).toMatchObject({
      weighting: expect.objectContaining({ type: 'uniform' })
    });
    expect(withWeight({ weighting: 'uniform', robust: 1 })).not.toHaveProperty('weighting.robust');
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
      getDataProductSchema().parse({ ...continuumImage, weighting: { type: 'natural' } })
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
    ['an unknown weighting', { weighting: { type: 'robust' } }],
    ['a robust above 2', { weighting: { type: 'briggs', robust: 2.5 } }],
    ['briggs without a robust', { weighting: { type: 'briggs' } }],
    ['a negative taper', { taper: -1 }],
    ['no polarisations', { polarisations: [] }],
    ['an unknown polarisation', { polarisations: ['Z'] }]
  ])('rejects an image with %s', (_, change) => {
    expect(valid({ ...continuumImage, ...change })).toBe(false);
  });

  // The weighting dropdown only changes the type, so a robust entered for briggs stays in the form
  test('ignores a robust left over from briggs, however invalid, for another weighting', () => {
    const leftOver = { ...continuumImage, weighting: { type: 'natural', robust: 99 } };
    const parsed = getDataProductSchema().safeParse(leftOver);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatchObject({ weighting: { type: 'natural' } });
    expect(parsed.data).not.toHaveProperty('weighting.robust');
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

  describe('values the backend stores as a number of steps', () => {
    const visibilities = dataProductFromPdm(pdmDataProducts[1]);
    const { step } = STEPPED_FIELD.TIME_AVERAGING_S;

    test('holds the physical value, and sends the number of steps', () => {
      expect(visibilities).toMatchObject({ timeAveragingS: 2 * step });
      expect(steppedToPdm(2 * step, STEPPED_FIELD.TIME_AVERAGING_S)).toBe(2);
    });

    test('accepts a value typed as the field shows it', () => {
      expect(valid({ ...visibilities, timeAveragingS: 0.849 })).toBe(true);
    });

    test.each([
      ['below one step', 0],
      ['between steps', 1.2],
      ['above twelve steps', 13 * step]
    ])('rejects a time averaging %s', (_, timeAveragingS) => {
      expect(valid({ ...visibilities, timeAveragingS })).toBe(false);
    });

    test('rejects a PST output sampling interval between steps', () => {
      const filterbank = dataProductFromPdm(pdmDataProducts[5]);
      expect(valid({ ...filterbank, outputSamplingIntervalMs: 0.3 })).toBe(false);
    });
  });

  test.each([
    [
      'an image size of zero',
      { imageSize: { value: 0, unit: 'deg' } },
      ['imageSize', 'value'],
      phtTranslations.imageSize.error
    ],
    [
      'no unit',
      { pixelSize: { value: 1, unit: null } },
      ['pixelSize', 'unit'],
      phtTranslations.pixelSize.unitError
    ],
    ['too many channels', { channelsOut: 41 }, ['channelsOut'], 'Valid range is 1 - 40'],
    [
      'no polarisations',
      { polarisations: [] },
      ['polarisations'],
      phtTranslations.polarisations.error
    ]
  ])('gives %s its translated message', (_, change, path, message) => {
    const issue = schema.safeParse({ ...continuumImage, ...change }).error?.issues[0];
    expect(issue).toMatchObject({ path, message });
  });
});

describe('new data products', () => {
  test.each(Object.values(DATA_PRODUCT_KIND))('gives a new %s valid defaults', (kind) => {
    const dp = newDataProduct(kind, 'obs-1');
    expect(dp).toMatchObject({ kind, observationId: 'obs-1' });
    expect(getDataProductSchema().safeParse(dp).error).toBeUndefined();
  });

  test('gives each new data product its own id', () => {
    const kind = DATA_PRODUCT_KIND.CONTINUUM_IMAGE;
    expect(newDataProduct(kind, 'obs-1').id).not.toBe(newDataProduct(kind, 'obs-1').id);
  });

  test.each([
    [FLOW_THROUGH_VALUE, DATA_PRODUCT_KIND.PST_FLOW_THROUGH],
    [DETECTED_FILTER_BANK_VALUE, DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK],
    [PULSAR_TIMING_VALUE, DATA_PRODUCT_KIND.PST_TIMING],
    [undefined, DATA_PRODUCT_KIND.PST_TIMING]
  ])('gives PST mode %s the %s kind', (pstMode, kind) => {
    expect(pstDataProductKind(pstMode)).toBe(kind);
  });
});

describe('updateImageSizes', () => {
  const image = newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1') as Parameters<
    typeof updateImageSizes
  >[0];

  test('sizes the image for the central frequency, keeping the other fields', () => {
    expect(updateImageSizes({ ...image, weighting: { type: 'natural' } }, 6000)).toEqual({
      ...image,
      weighting: { type: 'natural' },
      imageSize: { value: 0.073, unit: 'deg' },
      pixelSize: { value: 0.043, unit: 'arcsec' }
    });
  });

  test('leaves the sizes without a central frequency', () => {
    expect(updateImageSizes(image, 0)).toBe(image);
  });
});
