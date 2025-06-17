import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SKAOIcon from './skaoIcon';

describe('<SKAOIcon />', () => {
  test('renders correctly', () => {
    render(<SKAOIcon />);
  });
});
