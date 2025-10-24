import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import BackButton from './Back';
import '@testing-library/jest-dom';
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
    wrapper(<BackButton action={mockAction} />);
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
    screen.getByTestId('backButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<BackButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
  });
});
