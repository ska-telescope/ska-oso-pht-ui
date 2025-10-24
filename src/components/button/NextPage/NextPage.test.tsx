import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import NextPageButton from './NextPage';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
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
