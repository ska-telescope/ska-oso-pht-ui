import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusWrapper from './StatusWrapper';

describe('<StatusWrapper />', () => {
  test('renders correctly', () => {
    render(<StatusWrapper page={1} />);
  });
});
