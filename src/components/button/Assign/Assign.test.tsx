import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import AssignButton from './Assign';

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AssignButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
    screen.getByTestId('assignButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <AssignButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
  });
});
