import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import AssignButton from './Assign';
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
