import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridMembers from './GridMembers';

describe('<GridMembers />', () => {
  test('renders correctly', () => {
    render(<GridMembers />);
  });
});
