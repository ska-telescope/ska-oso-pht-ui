import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import VelocityType from './VelocityType';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<VelocityType />', () => {
  test('renders correctly', () => {
    wrapper(<VelocityType setVelType={vi.fn()} velType={0} />);
  });
});
