import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusIcon from './statusIcon';

describe('<StatusIcon />', () => {
  test('renders correctly', () => {
    render(
      <StatusIcon ariaDescription="" onClick={vi.fn()} ariaTitle={''} level={0} testId={''} />
    );
  });
});
