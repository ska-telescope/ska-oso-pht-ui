import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PHT from './PHT';

describe('<PHT />', () => {
  test('renders correctly', () => {
    render(<PHT />);
  });
});
