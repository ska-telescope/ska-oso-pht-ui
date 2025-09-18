import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import NextPageButton from './NextPage';
import '@testing-library/jest-dom';

describe('NextPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <NextPageButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('nextPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <NextPageButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
  test('renders correctly with page < 0', () => {
    render(
      <StoreProvider>
        <NextPageButton action={mockAction} page={-1} />
      </StoreProvider>
    );
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
