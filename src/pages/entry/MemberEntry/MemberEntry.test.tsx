import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberEntry from './MemberEntry';

describe('<MemberEntry />', () => {
  test('renders correctly', () => {
    render(<MemberEntry />);
  });
});
