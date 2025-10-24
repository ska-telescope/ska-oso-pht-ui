import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ValidateButton from './Validate';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Validate Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<ValidateButton action={mockAction} />);
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validationBtn.label');
    screen.getByTestId('validationBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<ValidateButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validationBtn.label');
  });
});
