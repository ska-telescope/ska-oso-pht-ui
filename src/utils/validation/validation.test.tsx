import { describe, it, expect } from 'vitest';
import { DataProductSDPNew, SDPFilterbankPSTData } from '../types/dataProduct';
import {
  DETECTED_FILTER_BANK_VALUE,
  CHANNELS_OUT_MAX,
  CHANNELS_OUT_MAX_COMBINED,
  CHANNELS_OUT_MIN_CONTINUUM,
  CHANNELS_OUT_MIN_SPECTRAL,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  IW_BRIGGS,
  IW_UNIFORM,
  PULSAR_TIMING_VALUE,
  STATUS_ERROR,
  STATUS_OK,
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_INTEGRATION_TIME_UNITS_M,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import { timeConversion } from '../helpers';
import { validateObservationPage, validateSDPPage } from './validation';

describe('validateSDPPage robust rules', () => {
  const makeProposalWithDataProduct = (data: any) =>
    ({
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data
        } as DataProductSDPNew
      ]
    }) as any;

  it('returns STATUS_ERROR when no data products exist', () => {
    expect(validateSDPPage({ dataProductSDP: [] } as any)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_OK for non-BRIGGS weighting (robust inactive)', () => {
    const proposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_UNIFORM,
      robust: 99,
      polarisations: ['I']
    });
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_OK for BRIGGS image data with robust in range', () => {
    const proposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_BRIGGS,
      robust: 1.5,
      polarisations: ['I']
    });
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_OK for BRIGGS visibilities data (robust inactive)', () => {
    const proposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_VISIBLE,
      weighting: IW_BRIGGS,
      robust: 999
    });
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('transitions Data Product breadcrumb status from STATUS_OK to STATUS_ERROR when robust becomes invalid', () => {
    const validProposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_BRIGGS,
      robust: 0,
      polarisations: ['I']
    });
    expect(validateSDPPage(validProposal)).toBe(STATUS_OK);

    const invalidProposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_BRIGGS,
      robust: 2.1,
      polarisations: ['I']
    });
    expect(validateSDPPage(invalidProposal)).toBe(STATUS_ERROR);
  });
});

describe('validateSDPPage polarisation rules', () => {
  it('returns STATUS_ERROR when an image data product has no polarisations selected', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_CONTINUUM }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: { dataProductType: DP_TYPE_IMAGES, polarisations: [] }
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_OK for a visibilities data product with no polarisations selected', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_CONTINUUM }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: {
            dataProductType: DP_TYPE_VISIBLE,
            polarisations: [],
            timeAveraging: 1,
            frequencyAveraging: 1
          }
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR when a PST flow-through data product has no polarisations selected', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_PST, pstMode: FLOW_THROUGH_VALUE }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: { dataProductType: FLOW_THROUGH_VALUE, polarisations: [] }
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_OK for a PST pulsar timing data product with no polarisations field', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_PST, pstMode: PULSAR_TIMING_VALUE }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: { dataProductType: PULSAR_TIMING_VALUE }
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR when a zoom/combined spectral data product has no polarisations selected', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_ZOOM }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: { polarisations: [] } // SDPSpectralData has no dataProductType field
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('ignores the hidden visibilities companion data product HiddenSDPData creates alongside a combined spectral product', () => {
    const proposal = {
      observations: [{ id: 'obs-1', type: TYPE_CONTINUUM_SPECTRAL }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: {
            polarisations: ['I', 'XX'],
            channelsOut: CHANNELS_OUT_MIN_SPECTRAL,
            imageSizeValue: 100,
            pixelSizeValue: 1
          } // the displayed spectral product - valid
        },
        {
          id: 'SDP-1-hidden',
          observationId: 'obs-1',
          // the auto-created hidden visibilities companion - never carries polarisations
          data: { dataProductType: DP_TYPE_VISIBLE, timeAveraging: 4, frequencyAveraging: 1 }
        }
      ]
    } as any;
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });
});

describe('validateSDPPage channelsOut rules', () => {
  const makeProposalWithDataProducts = (
    dataProducts: { data: any; observationId?: string }[],
    observations?: any[]
  ) =>
    ({
      observations,
      dataProductSDP: dataProducts.map((dp, idx) => ({
        id: `SDP-${idx + 1}`,
        observationId: dp.observationId ?? 'obs-1',
        data: {
          imageSizeValue: 100,
          pixelSizeValue: 1,
          timeAveraging: 1,
          frequencyAveraging: 1,
          ...dp.data
        }
      })) as DataProductSDPNew[]
    }) as any;

  const continuumObservations = [{ id: 'obs-1', type: TYPE_CONTINUUM }];

  it('returns STATUS_OK for a valid channelsOut value', () => {
    const proposal = makeProposalWithDataProducts(
      [
        {
          data: {
            dataProductType: DP_TYPE_IMAGES,
            channelsOut: CHANNELS_OUT_MIN_CONTINUUM,
            polarisations: ['I']
          }
        }
      ],
      continuumObservations
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR when channelsOut is below the minimum', () => {
    const proposal = makeProposalWithDataProducts(
      [{ data: { dataProductType: DP_TYPE_IMAGES, channelsOut: CHANNELS_OUT_MIN_CONTINUUM - 1 } }],
      continuumObservations
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_ERROR when channelsOut exceeds the standard maximum', () => {
    const proposal = makeProposalWithDataProducts(
      [{ data: { dataProductType: DP_TYPE_IMAGES, channelsOut: CHANNELS_OUT_MAX + 1 } }],
      continuumObservations
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_ERROR when channelsOut is not an integer', () => {
    const proposal = makeProposalWithDataProducts(
      [{ data: { dataProductType: DP_TYPE_IMAGES, channelsOut: 5.5 } }],
      continuumObservations
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_ERROR);
  });

  it('allows the combined-mode maximum when the linked observation is continuum+spectral', () => {
    const proposal = makeProposalWithDataProducts(
      [{ data: { channelsOut: CHANNELS_OUT_MAX + 1, polarisations: ['I'] } }],
      [{ id: 'obs-1', type: TYPE_CONTINUUM_SPECTRAL }]
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);

    const invalidProposal = makeProposalWithDataProducts(
      [{ data: { channelsOut: CHANNELS_OUT_MAX_COMBINED + 1, polarisations: ['I'] } }],
      [{ id: 'obs-1', type: TYPE_CONTINUUM_SPECTRAL }]
    );
    expect(validateSDPPage(invalidProposal)).toBe(STATUS_ERROR);
  });

  it('ignores a Visibilities-type data product even though it carries channelsOut', () => {
    // getProposal.tsx's backend mapping always writes a channelsOut key (defaulted to 0) onto
    // every data product, including Visibilities ones that have no real "channels out" concept.
    const proposal = makeProposalWithDataProducts(
      [{ data: { dataProductType: DP_TYPE_VISIBLE, channelsOut: 0 } }],
      continuumObservations
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('ignores the hidden Visibilities companion of a combined-mode observation', () => {
    // Regression test: the auto-added hidden companion for TYPE_CONTINUUM_SPECTRAL previously
    // got flagged as invalid because it inherits a channelsOut: 0 from the backend mapping,
    // even though only the primary (Images) data product's channelsOut is ever user-editable.
    const proposal = makeProposalWithDataProducts(
      [
        { data: { dataProductType: DP_TYPE_IMAGES, channelsOut: 4, polarisations: ['I'] } },
        { data: { dataProductType: DP_TYPE_VISIBLE, channelsOut: 0 } }
      ],
      [{ id: 'obs-1', type: TYPE_CONTINUUM_SPECTRAL }]
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('ignores channelsOut for observation types that never use it (e.g. PST)', () => {
    const proposal = makeProposalWithDataProducts(
      [{ data: { dataProductType: DP_TYPE_IMAGES, channelsOut: 0 } }],
      [{ id: 'obs-1', type: TYPE_PST }]
    );
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });
});

describe('validateSDPPage detected filterbank field rules', () => {
  const makeProposal = (
    data: Partial<SDPFilterbankPSTData>,
    pstMode = DETECTED_FILTER_BANK_VALUE
  ) =>
    ({
      observations: [{ id: 'obs-1', type: TYPE_PST, pstMode }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: {
            dataProductType: DETECTED_FILTER_BANK_VALUE,
            outputFrequencyResolution: 1,
            outputSamplingInterval: 1,
            dispersionMeasure: 1.5,
            rotationMeasure: -2.5,
            polarisations: ['I'],
            ...data
          }
        }
      ]
    }) as any;

  it('returns STATUS_OK when detected filterbank measures are valid decimals', () => {
    expect(validateSDPPage(makeProposal({}))).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR when dispersion measure is out of range', () => {
    expect(validateSDPPage(makeProposal({ dispersionMeasure: 100001 }))).toBe(STATUS_ERROR);
  });

  it('returns STATUS_ERROR when rotation measure is not numeric', () => {
    expect(validateSDPPage(makeProposal({ rotationMeasure: 'invalid' as any }))).toBe(STATUS_ERROR);
  });

  it('returns STATUS_ERROR when output frequency resolution is invalid', () => {
    expect(validateSDPPage(makeProposal({ outputFrequencyResolution: 1.5 }))).toBe(STATUS_ERROR);
  });

  it('returns STATUS_ERROR when output sampling interval is invalid', () => {
    expect(validateSDPPage(makeProposal({ outputSamplingInterval: 0 }))).toBe(STATUS_ERROR);
  });

  it('ignores detected filterbank values when their fields are not shown', () => {
    expect(
      validateSDPPage(
        makeProposal(
          {
            outputFrequencyResolution: 1.5,
            outputSamplingInterval: 0,
            dispersionMeasure: 100001,
            rotationMeasure: 'invalid' as any
          },
          FLOW_THROUGH_VALUE
        )
      )
    ).toBe(STATUS_OK);
  });
});

describe('validateSDPPage continuum visibilities rules', () => {
  const makeProposal = (
    data: { timeAveraging?: number; frequencyAveraging?: number },
    observationType = TYPE_CONTINUUM
  ) =>
    ({
      observations: [{ id: 'obs-1', type: observationType }],
      dataProductSDP: [
        {
          id: 'SDP-1',
          observationId: 'obs-1',
          data: {
            dataProductType: DP_TYPE_VISIBLE,
            timeAveraging: 1,
            frequencyAveraging: 1,
            ...data
          }
        }
      ]
    }) as any;

  it.each([
    ['time averaging below range', { timeAveraging: 0 }],
    ['time averaging off-step', { timeAveraging: 1.5 }],
    ['frequency averaging above range', { frequencyAveraging: 13 }],
    ['frequency averaging off-step', { frequencyAveraging: 1.5 }]
  ])('returns STATUS_ERROR when combined continuum-spectral %s is invalid', (_field, data) => {
    expect(validateSDPPage(makeProposal(data, TYPE_CONTINUUM_SPECTRAL))).toBe(STATUS_ERROR);
  });
});

describe('validateObservationPage supplied rules', () => {
  const baseObservation = {
    supplied: {
      type: SUPPLIED_TYPE_INTEGRATION,
      value: 1,
      units: SUPPLIED_INTEGRATION_TIME_UNITS_H
    }
  };

  it('returns STATUS_OK for non-autoLink when observations exist with valid supplied values', () => {
    const proposal = {
      observations: [baseObservation],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any, false)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR for integration supplied values above the converted max', () => {
    const maxMinutes = timeConversion(
      SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
      TIME_HOURS,
      SUPPLIED_INTEGRATION_TIME_UNITS_M
    );
    const proposal = {
      observations: [
        {
          ...baseObservation,
          supplied: {
            type: SUPPLIED_TYPE_INTEGRATION,
            value: maxMinutes + 1,
            units: SUPPLIED_INTEGRATION_TIME_UNITS_M
          }
        }
      ],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any, false)).toBe(STATUS_ERROR);
  });

  it('returns STATUS_OK for sensitivity supplied values greater than zero', () => {
    const proposal = {
      observations: [
        {
          ...baseObservation,
          supplied: {
            type: SUPPLIED_TYPE_SENSITIVITY,
            value: 5,
            units: 1
          }
        }
      ],
      targetObservation: []
    };
    expect(validateObservationPage(proposal as any, false)).toBe(STATUS_OK);
  });

  it('returns STATUS_ERROR for autoLink when target observations exist but supplied is invalid', () => {
    const proposal = {
      observations: [{ ...baseObservation, supplied: { ...baseObservation.supplied, value: -1 } }],
      targetObservation: [{ targetId: '1', observationId: 'obs-1' }]
    };
    expect(validateObservationPage(proposal as any, true)).toBe(STATUS_ERROR);
  });

  it('transitions Observation breadcrumb status from STATUS_OK to STATUS_ERROR when supplied becomes invalid', () => {
    const validProposal = {
      observations: [baseObservation],
      targetObservation: []
    };
    expect(validateObservationPage(validProposal as any, false)).toBe(STATUS_OK);

    const invalidProposal = {
      observations: [{ ...baseObservation, supplied: { ...baseObservation.supplied, value: -1 } }],
      targetObservation: []
    };
    expect(validateObservationPage(invalidProposal as any, false)).toBe(STATUS_ERROR);
  });
});
