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
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  IW_UNIFORM,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT,
  TAPER_DEFAULT,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';
import { checkDP } from './validation';

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
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            weighting: IW_UNIFORM,
            polarisations: ['I', 'XX'],
            channelsOut: 40,
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
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            channelsOut: 40,
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
            imageSizeValue: 2.5,
            imageSizeUnits: 0,
            pixelSizeValue: 1.6,
            pixelSizeUnits: 2,
            weighting: IW_UNIFORM,
            polarisations: [],
            channelsOut: 40,
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
