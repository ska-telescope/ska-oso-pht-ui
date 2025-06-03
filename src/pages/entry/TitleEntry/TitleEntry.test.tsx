import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitleEntry from './TitleEntry';

describe('<TitleEntry />', () => {
  test('renders correctly', () => {
    render(<TitleEntry page={0} />);
  });
});
