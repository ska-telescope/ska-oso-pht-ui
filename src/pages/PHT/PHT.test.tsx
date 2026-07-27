import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { SKAThemeProvider, THEME_LIGHT } from '@ska-telescope/ska-gui-components';

const wrapper = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ThemeA11yProvider>
          {' '}
          <SKAThemeProvider themeMode={THEME_LIGHT} accessibilityMode={0}>
            {component}
          </SKAThemeProvider>
        </ThemeA11yProvider>
      </StoreProvider>
    </MemoryRouter>
  );
};

describe('<PHT />', () => {
  test('renders correctly', () => {
    wrapper(
      <PHT
        themeMode={''}
        setThemeMode={function(_mode: string): void {
          throw new Error('Function not implemented.');
        }}
        accessibilityMode={0}
        setAccessibilityMode={function(_mode: number): void {
          throw new Error('Function not implemented.');
        }}
      />
    );
  });
});
