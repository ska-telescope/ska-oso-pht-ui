import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddButton from './Add';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
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
