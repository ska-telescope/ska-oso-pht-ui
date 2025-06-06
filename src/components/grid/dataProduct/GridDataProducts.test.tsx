import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridDataProducts from './GridDataProducts';

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    render(<GridDataProducts baseObservations={[]} />);
  });
});
