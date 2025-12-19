import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddButton from './Add';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Add Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<AddButton action={mockAction} />);
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('addButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<AddButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
