import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberAccess from './MemberAccess';

describe('<MemberAccess />', () => {
  test('renders correctly', () => {
    render(<MemberAccess />);
  });
});
