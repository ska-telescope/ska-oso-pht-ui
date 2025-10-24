import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DeleteButton from './Delete';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Delete Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<DeleteButton action={mockAction} />);
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
    screen.getByTestId('deleteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<DeleteButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
  });
});
