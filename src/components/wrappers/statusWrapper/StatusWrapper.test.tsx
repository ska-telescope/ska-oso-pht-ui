import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusWrapper from './StatusWrapper';
import { STATUS_ERROR } from '@/utils/constants';

describe('<StatusWrapper />', () => {
  test('renders correctly ( default )', () => {
    render(<StatusWrapper page={1} />);
  });
  test('renders correctly ( STATUS_ERROR  )', () => {
    render(<StatusWrapper page={1} level={STATUS_ERROR} />);
  });
  test('renders correctly ( 7 )', () => {
    render(<StatusWrapper page={1} level={7} />);
  });
});
