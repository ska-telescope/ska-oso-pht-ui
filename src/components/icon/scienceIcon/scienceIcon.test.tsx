import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TechnicalIcon from './scienceIcon';

describe('<TechnicalIcon />', () => {
  test('renders correctly', () => {
    render(<TechnicalIcon onClick={vi.fn()} />);
  });
});
