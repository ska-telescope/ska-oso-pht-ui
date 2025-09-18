import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SearchButton from './Search';
import '@testing-library/jest-dom';

describe('<SearchButton />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SearchButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
    screen.getByTestId('SearchButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <SearchButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
  });
});
