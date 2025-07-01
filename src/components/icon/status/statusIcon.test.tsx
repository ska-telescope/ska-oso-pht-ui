import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusIcon from './statusIcon';
import { STATUS_ERROR, STATUS_OK } from '@/utils/constants';

describe('<StatusIcon />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StatusIcon
        ariaDescription=""
        onClick={mockAction}
        ariaTitle={''}
        level={STATUS_ERROR}
        testId={''}
      />
    );
  });
  test('renders correctly with supplied text', () => {
    render(
      <StatusIcon
        ariaDescription=""
        onClick={mockAction}
        ariaTitle={''}
        level={STATUS_ERROR}
        text="?"
        testId={''}
      />
    );
  });
  test('renders correctly', () => {
    render(
      <StatusIcon
        ariaDescription=""
        onClick={mockAction}
        ariaTitle={''}
        level={STATUS_OK}
        testId={''}
      />
    );
  });
});
