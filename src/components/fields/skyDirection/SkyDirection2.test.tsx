import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkyDirection2 from './SkyDirection2';

describe('<SkyDirection2 />', () => {
  test('renders correctly', () => {
    render(<SkyDirection2 skyUnits={0} value={''} />);
  });
});
