import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import AssignButton from './Assign';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<AssignButton action={mockAction} />);
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
    screen.getByTestId('assignButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<AssignButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
  });
});
