import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import TargetNoSpecificSection from './targetNoSpecificSection';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<TargetNoSpecificSection />', () => {
  test('renders correctly', () => {
    wrapper(<TargetNoSpecificSection />);
  });
});
