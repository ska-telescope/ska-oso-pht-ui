import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamFileImport from './TeamFileImport';

describe('<TeamFileImport />', () => {
  test('renders correctly', () => {
    render(<TeamFileImport />);
  });
});
