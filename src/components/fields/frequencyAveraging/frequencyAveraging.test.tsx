import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import FrequencyAveraging from './frequencyAveraging';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key === 'frequencyAveraging.label') return 'Frequency averaging';
      if (key === 'frequencyAveraging.0') return 'kHz';
      return key;
    }
  })
}));

vi.mock('@ska-telescope/ska-gui-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ska-telescope/ska-gui-components')>();
  return {
    ...actual,
    DropDown: ({
      testId,
      disabled,
      label,
      value,
      options
    }: {
      testId: string;
      disabled: boolean;
      label: string;
      value: number;
      options: Array<{ label: string; value: number }>;
    }) => (
      <div
        data-testid={testId}
        data-disabled={String(disabled)}
        data-label={label}
        data-value={String(value)}
        data-options={JSON.stringify(options)}
      />
    )
  };
});

describe('<FrequencyAveraging />', () => {
  test('renders formatted units and expected 2-decimal dropdown options', () => {
    render(
      <StoreProvider>
        <FrequencyAveraging value={1} />
      </StoreProvider>
    );

    const dropdown = screen.getByTestId('frequencyAveraging');
    expect(dropdown).toHaveAttribute('data-label', 'Frequency averaging');
    expect(dropdown).toHaveAttribute('data-value', '1');
    expect(screen.getByText('kHz')).toBeInTheDocument();

    const options = JSON.parse(dropdown.getAttribute('data-options') || '[]') as Array<{
      label: string;
      value: number;
    }>;

    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ label: '5.43', value: 1 });
    expect(options[11]).toEqual({ label: '65.10', value: 12 });
  });

  test('passes disabled state to dropdown', () => {
    render(
      <StoreProvider>
        <FrequencyAveraging value={2} disabled />
      </StoreProvider>
    );

    expect(screen.getByTestId('frequencyAveraging')).toHaveAttribute('data-disabled', 'true');
  });
});
