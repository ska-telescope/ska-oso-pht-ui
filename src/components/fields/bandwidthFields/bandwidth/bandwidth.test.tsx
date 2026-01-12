import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import Bandwidth from './bandwidth';
import { BAND_LOW_STR, SA_AA2, TELESCOPE_MID_NUM } from '@/utils/constants.ts';

const value = 1;

vi.mock('@/utils/constants.ts', async () => {
  const actual = await import('@/utils/constants.ts');
  return {
    ...actual,
    BAND_LOW_STR: 'LOW',
    SA_AA2: 'aa2',
    TELESCOPE_MID_NUM: 2
  };
});

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<Bandwidth />', () => {
  test('renders correctly', () => {
    wrapper(
      <Bandwidth
        telescope={1}
        value={value}
        observingBand={BAND_LOW_STR}
        centralFrequency={200}
        centralFrequencyUnits={1}
        subarrayConfig={SA_AA2}
      />
    );
  });
  test('renders correctly ( suffix )', () => {
    wrapper(
      <Bandwidth
        observingBand={BAND_LOW_STR}
        telescope={TELESCOPE_MID_NUM}
        value={value}
        centralFrequencyUnits={1}
        suffix={'#'}
      />
    );
  });
});
