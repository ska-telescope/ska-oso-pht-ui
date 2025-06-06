import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridTargets from './GridTargets';

describe('<GridTargets />', () => {
  test('renders correctly', () => {
    render(<GridTargets raType={0} />);
  });
});
