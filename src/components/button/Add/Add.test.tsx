import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddButton from './Add';
import '@testing-library/jest-dom';

describe('Add Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AddButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('addButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <AddButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
