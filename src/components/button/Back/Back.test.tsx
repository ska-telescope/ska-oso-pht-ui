import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import BackButton from './Back';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
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
