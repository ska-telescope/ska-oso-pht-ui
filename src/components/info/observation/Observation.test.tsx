// ObservationInfo.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ObservationInfo from './Observation';
import { TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constantsSensCalc';
import { TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';

const TYPE_UNKNOWN = 9;

describe('ObservationInfo', () => {
  const baseObservation: Observation = {
    id: 'obs1',
    type: 0,
    telescope: 0,
    subarray: 0,
    linked: '',
    observingBand: 0,
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
    render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_CONTINUUM }} t={() => {}} />
    );
    expect(screen.getByTestId('continuum-grid')).toBeInTheDocument();
  });

  it('renders Spectral Grid', () => {
    render(<ObservationInfo observation={{ ...baseObservation, type: TYPE_ZOOM }} t={() => {}} />);
    expect(screen.getByTestId('spectral-grid')).toBeInTheDocument();
  });

  it('renders PST Grid', () => {
    render(<ObservationInfo observation={{ ...baseObservation, type: TYPE_PST }} t={() => {}} />);
    expect(screen.getByTestId('pst-grid')).toBeInTheDocument();
  });

  it('renders nothing for unknown type', () => {
    render(
      <ObservationInfo observation={{ ...baseObservation, type: TYPE_UNKNOWN }} t={() => {}} />
    );
    expect(screen.queryByTestId('continuum-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('spectral-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pst-grid')).not.toBeInTheDocument();
  });
});
