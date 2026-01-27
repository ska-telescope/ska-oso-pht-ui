import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import EffectiveResolution from './EffectiveResolution';
import { BAND_LOW_STR, TYPE_CONTINUUM } from '@/utils/constants';

describe('<EffectiveResolution />', () => {
  test('renders correctly', () => {
    render(
      <EffectiveResolution
        frequency={0}
        frequencyUnits={0}
        observingBand={BAND_LOW_STR}
        observationType={TYPE_CONTINUUM}
        spectralAveraging={0}
        spectralResolution={''}
      />
    );
  });
});
