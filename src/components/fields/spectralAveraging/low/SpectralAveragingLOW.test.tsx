import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveragingLOW from './SpectralAveragingLOW';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SpectralAveragingLOW />', () => {
  test('renders correctly', () => {
    wrapper(<SpectralAveragingLOW value={1} subarray={0} type={0} />);
  });
});
