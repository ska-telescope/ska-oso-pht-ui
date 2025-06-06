import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Velocity from './Velocity';

describe('<Velocity />', () => {
  test('renders correctly', () => {
    render(<Velocity setVel={vi.fn()} vel={''} velType={0} velUnit={0} />);
  });
});
