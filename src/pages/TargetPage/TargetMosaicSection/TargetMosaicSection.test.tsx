import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TargetMosaicSection from './targetMosaicSection';

describe('<TargetMosaicSection />', () => {
  test('renders correctly', () => {
    render(<TargetMosaicSection />);
  });
});
