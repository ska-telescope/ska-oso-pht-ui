import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
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
