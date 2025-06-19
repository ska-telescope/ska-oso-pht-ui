import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteObservationConfirmation from './deleteObservationConfirmation';

describe('<DeleteObservationConfirmation />', () => {
  test('renders correctly', () => {
    render(
      <DeleteObservationConfirmation
        action={vi.fn()}
        observation={{
          id: '',
          telescope: 0,
          subarray: 0,
          linked: '',
          type: 0,
          observingBand: 0,
          weather: undefined,
          elevation: 0,
          centralFrequency: 0,
          centralFrequencyUnits: 0,
          bandwidth: 0,
          continuumBandwidth: 0,
          continuumBandwidthUnits: 0,
          spectralAveraging: undefined,
          tapering: undefined,
          imageWeighting: 0,
          robust: 0,
          supplied: {
            type: 0,
            value: 0,
            units: 0
          },
          spectralResolution: '',
          effectiveResolution: '',
          numSubBands: undefined,
          num15mAntennas: undefined,
          num13mAntennas: undefined,
          numStations: undefined
        }}
        open={true}
        setOpen={vi.fn()}
      />
    );
  });
});
