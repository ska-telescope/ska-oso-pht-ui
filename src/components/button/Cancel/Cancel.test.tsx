import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from './Cancel';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Cancel Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<CancelButton action={mockAction} />);
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<CancelButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
  });
});
