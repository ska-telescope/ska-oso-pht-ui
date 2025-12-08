import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ConfirmButton from './Confirm';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('Confirm Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<ConfirmButton action={mockAction} />);
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
    screen.getByTestId('confirmButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<ConfirmButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
  });
});
