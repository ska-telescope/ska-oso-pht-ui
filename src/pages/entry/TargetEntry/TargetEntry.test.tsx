import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetEntry from './TargetEntry';

describe('<TargetEntry />', () => {
  test('renders correctly', () => {
    render(<TargetEntry raType={0} />);
  });
});
