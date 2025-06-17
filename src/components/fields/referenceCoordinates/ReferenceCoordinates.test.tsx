import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReferenceCoordinates from './ReferenceCoordinates';

describe('<ReferenceCoordinates />', () => {
  test('renders correctly', () => {
    render(<ReferenceCoordinates value={0} />);
  });
});
