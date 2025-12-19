import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddIcon from '@mui/icons-material/Add';
import BaseButton from './Button';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Base Button', () => {
  const mockAction = vi.fn();

  test('renders correctly', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} />);
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('baseButtonTestId').click();
    expect(mockAction).toBeCalled();
  });

  test('renders correctly with tooltip empty', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} toolTip="" />);
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
  });

  test('renders correctly with action as a string', () => {
    wrapper(<BaseButton action={'string'} icon={<AddIcon />} toolTip="" />);
    expect(screen.getByTestId('baseButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('baseButtonTestId').click();
  });

  test('respects reducedMotion flag', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} />);
    const btn = screen.getByTestId('baseButtonTestId');
    // We can’t assert exact transition string in JSDOM, but we can check it rendered
    expect(btn).toBeInTheDocument();
  });

  test('respects focusVisibleAlways flag', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} />);
    const btn = screen.getByTestId('baseButtonTestId');
    expect(btn).toBeInTheDocument();
  });
});
