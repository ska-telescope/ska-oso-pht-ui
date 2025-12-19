import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ResetButton from './Reset';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Reset Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<ResetButton action={mockAction} />);
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
    screen.getByTestId('resetButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<ResetButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
  });
});
