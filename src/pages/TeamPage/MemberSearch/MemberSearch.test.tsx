import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberSearch from './MemberSearch';

describe('<MemberSearch />', () => {
  test('renders correctly', () => {
    render(<MemberSearch />);
  });
});
