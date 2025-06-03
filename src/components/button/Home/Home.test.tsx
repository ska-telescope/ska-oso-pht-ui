import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeButton from './Home';
import '@testing-library/jest-dom';

describe('Delete Button', () => {
  test('renders correctly', () => {
    render(<HomeButton />);
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
  });
  test('renders correctly with tooltip empty', () => {
    render(<HomeButton toolTip="" />);
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
  });
});
