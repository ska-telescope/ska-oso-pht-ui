import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import NextPageButton from './NextPage';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('NextPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<NextPageButton action={mockAction} />);
    screen.getByRole('button', { name: 'addBtn.label' }).click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<NextPageButton action={mockAction} toolTip="" />);
    expect(screen.getByRole('button', { name: 'addBtn.label' })).toBeInTheDocument();
  });
  test('renders correctly with page < 0', () => {
    wrapper(<NextPageButton action={mockAction} page={-1} />);
    expect(screen.getByRole('button', { name: 'addBtn.label' })).toBeInTheDocument();
  });
});
