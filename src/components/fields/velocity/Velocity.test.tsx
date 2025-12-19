import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import Velocity from './Velocity';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<Velocity />', () => {
  test('renders correctly', () => {
    wrapper(<Velocity setVel={vi.fn()} vel={''} velType={0} velUnit={0} />);
  });
});
