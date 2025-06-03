import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetFileImport from './TargetFileImport';

describe('<TargetFileImport />', () => {
  test('renders correctly', () => {
    render(<TargetFileImport raType={0} />);
  });
});
