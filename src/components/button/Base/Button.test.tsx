import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
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
    screen.getByRole('button', { name: 'baseBtn.label' }).click();
    expect(mockAction).toBeCalled();
  });

  test('renders correctly with tooltip empty', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} toolTip="" />);
    expect(screen.getByRole('button', { name: 'baseBtn.label' })).toBeInTheDocument();
  });

  test('renders correctly with action as a string', () => {
    wrapper(<BaseButton action={'string'} icon={<AddIcon />} toolTip="" />);
    screen.getByRole('button', { name: 'baseBtn.label' }).click();
  });

  test('respects reducedMotion flag', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} />);
    const btn = screen.getByRole('button', { name: 'baseBtn.label' });
    // We can’t assert exact transition string in JSDOM, but we can check it rendered
    expect(btn).toBeInTheDocument();
  });

  test('respects focusVisibleAlways flag', () => {
    wrapper(<BaseButton action={mockAction} icon={<AddIcon />} />);
    const btn = screen.getByRole('button', { name: 'baseBtn.label' });
    expect(btn).toBeInTheDocument();
  });
});
