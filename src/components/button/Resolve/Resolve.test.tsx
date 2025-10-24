import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ResolveButton from './Resolve';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Resolve Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<ResolveButton action={mockAction} />);
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
    screen.getByTestId('resolveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<ResolveButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
  });
});
