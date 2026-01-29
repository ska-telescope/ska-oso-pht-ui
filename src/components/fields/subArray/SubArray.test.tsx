import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SubArray from './SubArray';
import {
  BAND_1_STR,
  BAND_LOW_STR,
  SA_AA2,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM
} from '@/utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SubArray />', () => {
  test('renders correctly (low)', () => {
    wrapper(<SubArray observingBand={BAND_LOW_STR} telescope={TELESCOPE_LOW_NUM} value={SA_AA2} />);
  });
  test('renders correctly ( telescope mid )', () => {
    wrapper(<SubArray observingBand={BAND_1_STR} telescope={TELESCOPE_MID_NUM} value={SA_AA2} />);
  });
  test('renders correctly ( invalid observingBand )', () => {
    wrapper(<SubArray observingBand={'99'} telescope={TELESCOPE_LOW_NUM} value={SA_AA2} />);
  });
  test('renders correctly ( suffix )', () => {
    wrapper(
      <SubArray
        observingBand={BAND_LOW_STR}
        suffix={'#'}
        telescope={TELESCOPE_LOW_NUM}
        value={SA_AA2}
      />
    );
  });
});
