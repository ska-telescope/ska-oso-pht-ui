import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PreviousPageButton from './PreviousPage';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('PreviousPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<PreviousPageButton action={mockAction} />);
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('previousPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<PreviousPageButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
  });
});
