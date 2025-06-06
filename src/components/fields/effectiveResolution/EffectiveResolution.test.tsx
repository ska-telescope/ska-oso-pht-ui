import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import EffectiveResolution from './EffectiveResolution';

describe('<EffectiveResolution />', () => {
  test('renders correctly', () => {
    render(
      <EffectiveResolution
        frequency={0}
        frequencyUnits={0}
        observingBand={0}
        observationType={0}
        spectralAveraging={0}
        spectralResolution={''}
      />
    );
  });
});
