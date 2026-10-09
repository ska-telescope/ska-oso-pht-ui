import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
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
