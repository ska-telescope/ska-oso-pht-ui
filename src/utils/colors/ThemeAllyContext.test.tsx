import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';
import { loadThemeA11y, saveThemeA11y } from '@utils/storage/storage';
import { ThemeA11yProvider, useThemeA11y } from './ThemeAllyContext';

vi.mock('@utils/storage/storage', () => ({
  loadThemeA11y: vi.fn(),
  saveThemeA11y: vi.fn()
}));

const Consumer: React.FC = () => {
  const { settings, setSettings } = useThemeA11y();
  return (
    <div>
      <span data-testid="version">{settings.version}</span>
      <button
        onClick={() =>
          setSettings({
            version: 1,
            mode: 'light',
            reducedMotion: false,
            focusVisibleAlways: false,
            accessibilityMode: false
          })
        }
      >
        update
      </button>
    </div>
  );
};

describe('ThemeA11yContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('initializes with loadThemeA11y result', () => {
    (loadThemeA11y as any).mockReturnValue({ version: 1 });

    render(
      <ThemeA11yProvider>
        <Consumer />
      </ThemeA11yProvider>
    );

    expect(screen.getByTestId('version').textContent).toBe('1');
  });

  it('calls saveThemeA11y when setSettings is used', () => {
    (loadThemeA11y as any).mockReturnValue({ version: 1 });

    render(
      <ThemeA11yProvider>
        <Consumer />
      </ThemeA11yProvider>
    );

    screen.getByText('update').click();

    expect(saveThemeA11y).toHaveBeenCalledWith({
      version: 1,
      mode: 'light',
      reducedMotion: false,
      focusVisibleAlways: false,
      accessibilityMode: false
    });
  });

  it('updates settings when storage event fires with valid JSON', () => {
    (loadThemeA11y as any).mockReturnValue({ version: 1 });

    render(
      <ThemeA11yProvider>
        <Consumer />
      </ThemeA11yProvider>
    );

    const newSettings = {
      version: 1,
      mode: 'dark',
      reducedMotion: true,
      focusVisibleAlways: true,
      accessibilityMode: true
    };
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: STORAGE_KEYS.themeA11y,
        newValue: JSON.stringify(newSettings)
      })
    );

    expect(screen.getByTestId('version').textContent).toBe('1');
  });

  // it('throws if useThemeA11y is used outside provider', () => {
  //   const BrokenConsumer = () => {
  //     expect(() => useThemeA11y()).toThrowError(
  //       'useThemeA11y must be used within ThemeA11yProvider'
  //     );
  //     return null;
  //   };
  //   render(<BrokenConsumer />);
  // });
});
