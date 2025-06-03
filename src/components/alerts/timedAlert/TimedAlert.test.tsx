import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimedAlert from './TimedAlert';

describe('<TimedAlert />', () => {
  test('renders correctly', () => {
    render(<TimedAlert color={undefined} testId={''} text={''} />);
  });
});
