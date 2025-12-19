import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SubmitButton from './Submit';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Submit Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<SubmitButton action={mockAction} />);
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
    screen.getByTestId('submitBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<SubmitButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
  });
});
