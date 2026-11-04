import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import DeleteButton from './Delete';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Delete Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<DeleteButton action={mockAction} />);
    screen.getByRole('button', { name: 'deleteBtn.label' }).click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<DeleteButton action={mockAction} toolTip="" />);
    expect(screen.getByRole('button', { name: 'deleteBtn.label' })).toBeInTheDocument();
  });
});
