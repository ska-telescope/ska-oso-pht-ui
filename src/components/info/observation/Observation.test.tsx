import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ObservationInfo from './Observation';
import {
  newSvObservation,
  OBSERVING_MODE,
  type ObservingMode
} from '@/models/proposals/observations';

const render_ = (mode: ObservingMode) =>
  render(<ObservationInfo observation={newSvObservation(mode, 15)} t={() => {}} />);

describe('ObservationInfo', () => {
  it('renders Continuum Grid', () => {
    render_(OBSERVING_MODE.CONTINUUM);
    expect(screen.getByTestId('continuum-grid')).toBeInTheDocument();
  });

  it('renders Spectral Grid', () => {
    render_(OBSERVING_MODE.SPECTRAL);
    expect(screen.getByTestId('spectral-grid')).toBeInTheDocument();
  });

  it('renders PST Grid', () => {
    render_(OBSERVING_MODE.PST);
    expect(screen.getByTestId('pst-grid')).toBeInTheDocument();
  });

  it('renders nothing for continuum and spectral line, which has no grid yet', () => {
    render_(OBSERVING_MODE.CONTINUUM_SPECTRAL);
    expect(screen.queryByTestId('continuum-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('spectral-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('pst-grid')).not.toBeInTheDocument();
  });
});
