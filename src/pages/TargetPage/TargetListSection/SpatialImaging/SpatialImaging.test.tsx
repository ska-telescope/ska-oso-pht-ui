import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpatialImaging from './SpatialImaging';

describe('<SpatialImaging />', () => {
  test('renders correctly', () => {
    render(<SpatialImaging />);
  });
});
