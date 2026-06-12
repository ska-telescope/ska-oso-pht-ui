import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import Velocity from './Velocity';
import { VELOCITY_TYPE } from '../../../utils/constants';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<Velocity />', () => {
  test('renders correctly', () => {
    wrapper(<Velocity setVel={vi.fn()} vel={''} velType={0} velUnit={0} />);
  });

  test('displays error when a non-numeric value is entered in the velocity field', () => {
    wrapper(
      <Velocity
        setVel={vi.fn()}
        vel={'abc'}
        velType={VELOCITY_TYPE.VELOCITY}
        velUnit={0}
      />
    );

    expect(screen.getByText('Numeric value required')).toBeInTheDocument();
  });
});
