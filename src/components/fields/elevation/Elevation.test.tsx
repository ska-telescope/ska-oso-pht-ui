import { describe, test } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { render } from '@testing-library/react';
import Elevation from './Elevation';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<Elevation />', () => {
  test('renders correctly', () => {
    wrapper(<Elevation value={20} />);
  });
  test('renders correctly, isLow', () => {
    wrapper(<Elevation isLow value={0} />);
  });
  test('renders correctly, value > max', () => {
    wrapper(<Elevation isLow value={100} />);
  });
});
