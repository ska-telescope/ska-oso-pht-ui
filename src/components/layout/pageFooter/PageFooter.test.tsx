import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageFooter from './PageFooter';

describe('<PageFooter />', () => {
  test('renders correctly', () => {
    render(<PageFooter pageNo={1} />);
  });
});
