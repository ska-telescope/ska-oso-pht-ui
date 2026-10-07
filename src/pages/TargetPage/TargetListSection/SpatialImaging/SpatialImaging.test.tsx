import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import SpatialImaging from './SpatialImaging';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<SpatialImaging />', () => {
  test('renders correctly', () => {
    wrapper(<SpatialImaging />);
  });
});
