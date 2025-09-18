import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DeleteButton from './Delete';
import '@testing-library/jest-dom';

describe('Delete Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <DeleteButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
    screen.getByTestId('deleteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <DeleteButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
  });
});
