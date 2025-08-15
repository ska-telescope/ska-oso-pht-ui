import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SearchButton from './Search';
import '@testing-library/jest-dom';

describe('<SearchButton />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<SearchButton action={mockAction} />);
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
    screen.getByTestId('SearchButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<SearchButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
  });
});
