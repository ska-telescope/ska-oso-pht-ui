import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ResolveButton from './Resolve';
import '@testing-library/jest-dom';

describe('Resolve Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ResolveButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
    screen.getByTestId('resolveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <ResolveButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
  });
});
