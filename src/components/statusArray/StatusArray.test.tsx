import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import StatusArray from './StatusArray';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StatusArray />', () => {
  test('renders correctly', () => {
    wrapper(<StatusArray />);
  });
});
