import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import EdgeSlider from './EdgeSlider';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<EdgeSlider />', () => {
  test('renders correctly', () => {
    wrapper(<EdgeSlider />);
  });
});
