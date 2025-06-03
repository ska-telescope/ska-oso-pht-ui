import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SciencePage from './SciencePage';

describe('<SciencePage />', () => {
  test('renders correctly', () => {
    render(<SciencePage />);
  });
});
