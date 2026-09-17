import { describe, it, expect } from 'vitest';
import { DataProductSDPNew, SDPFilterbankPSTData } from '../types/dataProduct';
import {
  DETECTED_FILTER_BANK_VALUE,
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
          data: { dataProductType: DP_TYPE_VISIBLE, polarisations: [] }
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
          data: { polarisations: ['I', 'XX'] } // the displayed spectral product - valid
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
