import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StandardAlert from './StandardAlert';

describe('<StandardAlert />', () => {
  test('renders correctly', () => {
    render(<StandardAlert color={undefined} testId={''} text={''} />);
  });
});
