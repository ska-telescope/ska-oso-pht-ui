import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ObservationEntry from './ObservationEntry';

describe('<ObservationEntry />', () => {
  test('renders correctly', () => {
    render(<ObservationEntry />);
  });
});
