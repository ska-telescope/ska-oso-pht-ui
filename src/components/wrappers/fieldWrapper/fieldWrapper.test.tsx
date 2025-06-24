import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import FieldWrapper from './FieldWrapper';

describe('<FieldWrapper />', () => {
  test('renders correctly', () => {
    render(<FieldWrapper />);
  });
  test('renders correctly', () => {
    render(<FieldWrapper big />);
  });
});
