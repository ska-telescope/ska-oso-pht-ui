import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Icon from './Icon';

describe('<Icon />', () => {
  test('renders correctly', () => {
    render(<Icon onClick={vi.fn()} icon={undefined} testId={''} toolTip={''} />);
  });
});
