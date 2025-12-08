import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, CssBaseline } from '@mui/material';
import { AppThemeProvider } from './AppThemeProvider';
import { ThemeA11yProvider, useThemeA11y } from '@/utils/colors/ThemeAllyContext';

const TestConsumer = () => {
  const { settings, setSettings } = useThemeA11y();
  return (
    <div>
      <span data-testid="mode">{settings.mode}</span>
      <Button onClick={() => setSettings({ ...settings, mode: 'dark' })}>Toggle Dark</Button>
    </div>
  );
};

describe('AppThemeProvider', () => {
  it('renders children inside ThemeProvider', () => {
    render(
      <ThemeA11yProvider>
        <AppThemeProvider>
          <div data-testid="child">Hello world</div>
        </AppThemeProvider>
      </ThemeA11yProvider>
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello world');
  });

  it('provides default theme settings', () => {
    render(
      <ThemeA11yProvider>
        <AppThemeProvider>
          <TestConsumer />
        </AppThemeProvider>
      </ThemeA11yProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('updates theme mode when setSettings is called', () => {
    render(
      <ThemeA11yProvider>
        <AppThemeProvider>
          <TestConsumer />
        </AppThemeProvider>
      </ThemeA11yProvider>
    );

    const button = screen.getByRole('button', { name: /toggle dark/i });
    fireEvent.click(button);

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('applies CssBaseline styles', () => {
    render(
      <ThemeA11yProvider>
        <AppThemeProvider>
          <CssBaseline />
          <div data-testid="baseline">Baseline applied</div>
        </AppThemeProvider>
      </ThemeA11yProvider>
    );
    expect(screen.getByTestId('baseline')).toHaveTextContent('Baseline applied');
  });
});
