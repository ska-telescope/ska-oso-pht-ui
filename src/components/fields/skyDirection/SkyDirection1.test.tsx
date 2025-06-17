import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkyDirection1 from './SkyDirection1';

describe('<SkyDirection1 />', () => {
  test('renders correctly', () => {
    render(<SkyDirection1 skyUnits={0} value={''} />);
  });
});
