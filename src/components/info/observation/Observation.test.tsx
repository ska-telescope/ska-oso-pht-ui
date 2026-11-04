// ObservationInfo.test.tsx
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ObservationInfo from './Observation';
import { TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constants';
import { BAND_LOW_STR, TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';

const TYPE_UNKNOWN = 9;

describe('ObservationInfo', () => {
  const baseObservation: Observation = {
    id: 'obs1',
    type: 0,
    telescope: 0,
    subarray: '',

    observingBand: BAND_LOW_STR,
    weather: 0,
    elevation: 0,
    centralFrequency: 0,
    centralFrequencyUnits: 0,
    bandwidth: 0,
    continuumBandwidth: 0,
    continuumBandwidthUnits: 0,
    spectralResolution: '0',
    supplied: {
      type: 0,
      value: 0,
      units: 0
    },
    effectiveResolution: '0'
  };

  it('renders Continuum Grid', () => {
    const { container } = render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_CONTINUUM }} t={() => {}} />
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders Spectral Grid', () => {
    const { container } = render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_ZOOM }} t={() => {}} />
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders PST Grid', () => {
    const { container } = render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_PST }} t={() => {}} />
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  it('renders nothing for unknown type', () => {
    const { container } = render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_UNKNOWN }} t={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
