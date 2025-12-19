import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
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
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('nextPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<NextPageButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
  test('renders correctly with page < 0', () => {
    wrapper(<NextPageButton action={mockAction} page={-1} />);
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
