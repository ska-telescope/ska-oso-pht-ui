import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddIcon from '@mui/icons-material/Add';
import BaseButton from './Button';
import '@testing-library/jest-dom';

describe('Base Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <BaseButton action={mockAction} icon={<AddIcon />} />
      </StoreProvider>
    );
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('baseButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <BaseButton action={mockAction} icon={<AddIcon />} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
  });
  test('renders correctly with action as a string', () => {
    render(
      <StoreProvider>
        <BaseButton action={'string'} icon={<AddIcon />} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('baseButtonTestId').click();
  });
});
