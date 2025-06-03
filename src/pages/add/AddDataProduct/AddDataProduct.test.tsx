import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddDataProduct from './AddDataProduct';

describe('<AddDataProduct />', () => {
  test('renders correctly', () => {
    render(<AddDataProduct />);
  });
});
