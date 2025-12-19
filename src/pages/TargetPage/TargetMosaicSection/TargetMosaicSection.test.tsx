import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TargetMosaicSection from './targetMosaicSection';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<TargetMosaicSection />', () => {
  test('renders correctly', () => {
    wrapper(<TargetMosaicSection />);
  });
});
