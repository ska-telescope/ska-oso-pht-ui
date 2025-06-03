import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageBanner from './PageBanner';

describe('<PageBanner />', () => {
  test('renders correctly', () => {
    render(<PageBanner pageNo={1} />);
  });
});
