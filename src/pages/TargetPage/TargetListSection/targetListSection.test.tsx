import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetListSection from './targetListSection';

describe('<TargetListSection />', () => {
  test('renders correctly', () => {
    render(<TargetListSection />);
  });
});
