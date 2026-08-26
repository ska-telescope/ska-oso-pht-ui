import { describe, it, expect } from 'vitest';
import {
  DataProductSDPNew,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPTimingPSTData,
  SDPVisibilitiesContinuumData
} from '../types/dataProduct';
import {
  CHANNELS_OUT_DEFAULT,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IW_BRIGGS,
  IW_UNIFORM,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT,
  STATUS_ERROR,
  STATUS_OK,
  SUPPLIED_INTEGRATION_TIME_MAX_HOURS,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_INTEGRATION_TIME_UNITS_M,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TAPER_DEFAULT,
  TIME_HOURS,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import { timeConversion } from '../helpers';
import { checkDP, validateObservationPage, validateSDPPage } from './validation';

describe('checkDP for spectral data product', () => {
  it('returns 1 for valid spectral data product', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: IMAGE_SIZE_DEFAULT,
            imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
            pixelSizeValue: PIXEL_SIZE_DEFAULT,
            pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
            weighting: IW_UNIFORM,
            polarisations: ['I', 'XX'],
            channelsOut: CHANNELS_OUT_DEFAULT,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(1);
  });

  it('returns 0 if polarisations field is missing', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: IMAGE_SIZE_DEFAULT,
            imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
            pixelSizeValue: PIXEL_SIZE_DEFAULT,
            pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
            channelsOut: CHANNELS_OUT_DEFAULT,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if polarisations is empty', () => {
    const proposal = {
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            imageSizeValue: IMAGE_SIZE_DEFAULT,
            imageSizeUnits: IMAGE_SIZE_UNIT_DEFAULT,
            pixelSizeValue: PIXEL_SIZE_DEFAULT,
            pixelSizeUnits: PIXEL_SIZE_UNIT_DEFAULT,
            weighting: IW_UNIFORM,
            polarisations: [],
            channelsOut: CHANNELS_OUT_DEFAULT,
            robust: ROBUST_DEFAULT,
            taperValue: TAPER_DEFAULT,
            continuumSubtraction: true
          } as SDPSpectralData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if no targetObservation', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: []
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if no observation', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      observations: [],
      dataProductSDP: []
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if dataProductSDP is undefined', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ]
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if dataProductSDP[0] is undefined', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: []
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });
});

describe('checkDP for continuum data product', () => {
  it('returns 1 for valid image data product', () => {
    const proposal = {
      scienceCategory: TYPE_CONTINUUM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: DP_TYPE_IMAGES,
            imageSizeValue: 100,
            imageSizeUnits: 1,
            pixelSizeValue: 0.5,
            pixelSizeUnits: 1,
            weighting: IW_UNIFORM,
            taperValue: 1,
            channelsOut: 32,
            polarisations: ['XX', 'YY'],
            robust: 1
          } as SDPImageContinuumData
        } as DataProductSDPNew
      ]
    };
    expect(checkDP(proposal as any)).toEqual(1);
  });

  it('returns 0 if polarisations is empty for image', () => {
    const proposal = {
      scienceCategory: TYPE_CONTINUUM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: DP_TYPE_IMAGES,
            imageSizeValue: 100,
            imageSizeUnits: 1,
            pixelSizeValue: 0.5,
            pixelSizeUnits: 1,
            weighting: IW_UNIFORM,
            taperValue: 1,
            channelsOut: 32,
            polarisations: [],
            robust: 1
          } as SDPImageContinuumData
        } as DataProductSDPNew
      ]
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 1 for valid visibilities data product', () => {
    const proposal = {
      scienceCategory: TYPE_CONTINUUM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: DP_TYPE_VISIBLE,
            timeAveraging: 10,
            frequencyAveraging: 20
          } as SDPVisibilitiesContinuumData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(1);
  });

  it('returns 0 if dataProductSDP is undefined', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: undefined
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 0 if dataProductSDP[0] is empty', () => {
    const proposal = {
      scienceCategory: TYPE_ZOOM,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: null
        }
      ],
      dataProductSDP: []
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });
});

describe('checkDP for pst data product', () => {
  it('returns 1 for valid pst flow through data product', () => {
    const proposal = {
      scienceCategory: TYPE_PST,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: FLOW_THROUGH_VALUE
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: FLOW_THROUGH_VALUE,
            polarisations: ['XX', 'YY'],
            bitDepth: 20
          } as SDPFlowthroughPSTData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(1);
  });

  it('returns 0 for missing polarisations on pst flow through data product', () => {
    const proposal = {
      scienceCategory: TYPE_PST,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: FLOW_THROUGH_VALUE
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: FLOW_THROUGH_VALUE,
            polarisations: [],
            bitDepth: 20
          } as SDPFlowthroughPSTData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(0);
  });

  it('returns 1 for pst pulsar timing data product', () => {
    const proposal = {
      scienceCategory: TYPE_PST,
      targetObservation: [{ targetId: '1' }],
      observations: [
        {
          id: 'obs-123',
          pstMode: PULSAR_TIMING_VALUE
        }
      ],
      dataProductSDP: [
        {
          id: 'SDP-0000000',
          observationId: 'obs-123',
          data: {
            dataProductType: PULSAR_TIMING_VALUE
          } as SDPTimingPSTData
        }
      ] as DataProductSDPNew[]
    };
    expect(checkDP(proposal as any)).toEqual(1);
  });
});

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
      robust: 99
    });
    expect(validateSDPPage(proposal)).toBe(STATUS_OK);
  });

  it('returns STATUS_OK for BRIGGS image data with robust in range', () => {
    const proposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_BRIGGS,
      robust: 1.5
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
      robust: 0
    });
    expect(validateSDPPage(validProposal)).toBe(STATUS_OK);

    const invalidProposal = makeProposalWithDataProduct({
      dataProductType: DP_TYPE_IMAGES,
      weighting: IW_BRIGGS,
      robust: 2.1
    });
    expect(validateSDPPage(invalidProposal)).toBe(STATUS_ERROR);
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
