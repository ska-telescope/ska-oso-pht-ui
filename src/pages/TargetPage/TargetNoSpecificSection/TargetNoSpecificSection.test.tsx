import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetNoSpecificSection from './targetNoSpecificSection';

describe('<TargetNoSpecificSection />', () => {
  test('renders correctly', () => {
    render(<TargetNoSpecificSection />);
  });
});
