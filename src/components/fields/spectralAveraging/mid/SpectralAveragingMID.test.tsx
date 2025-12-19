import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SpectralAveragingMID from './SpectralAveragingMID';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SpectralAveragingMID />', () => {
  test('renders correctly', () => {
    wrapper(<SpectralAveragingMID value={1} />);
  });
});
