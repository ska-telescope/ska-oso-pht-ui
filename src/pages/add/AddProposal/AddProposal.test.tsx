import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddProposal from './AddProposal';

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    render(<AddProposal />);
  });
});
