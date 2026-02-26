import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SensCalcButton from './SensCalc';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('SensCalc Button', () => {
  test('renders correctly', () => {
    wrapper(<SensCalcButton />);
    expect(screen.getByTestId('SensCalcButtonTestId')).toHaveTextContent('sensCalc.button');
    screen.getByTestId('SensCalcButtonTestId').click();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<SensCalcButton toolTip="" />);
    expect(screen.getByTestId('SensCalcButtonTestId')).toHaveTextContent('sensCalc.button');
  });
});
