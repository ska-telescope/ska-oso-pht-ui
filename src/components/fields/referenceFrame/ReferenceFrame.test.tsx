import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReferenceFrame from './ReferenceFrame';

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    render(<ReferenceFrame value={0} />);
  });
});
