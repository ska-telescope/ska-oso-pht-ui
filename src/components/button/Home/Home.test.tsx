import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import HomeButton from './Home';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Home Button', () => {
  test('renders correctly', () => {
    wrapper(<HomeButton />);
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
    screen.getByTestId('homeButtonTestId').click();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<HomeButton toolTip="" />);
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
  });
});
