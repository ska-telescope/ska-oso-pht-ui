import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SearchButton from './Search';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('<SearchButton />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<SearchButton action={mockAction} />);
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
    screen.getByTestId('SearchButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<SearchButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('SearchButtonTestId')).toHaveTextContent('search.label');
  });
});
