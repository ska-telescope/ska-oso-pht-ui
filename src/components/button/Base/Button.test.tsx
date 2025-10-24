import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddIcon from '@mui/icons-material/Add';
import BaseButton from './Button';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
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
});
