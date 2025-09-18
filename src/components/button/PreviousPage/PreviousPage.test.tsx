import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PreviousPageButton from './PreviousPage';
import '@testing-library/jest-dom';

describe('PreviousPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PreviousPageButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('previousPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <PreviousPageButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
  });
});
