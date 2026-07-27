import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TimeAveraging from './timeAveraging';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key === 'timeAveraging.label') return 'Time averaging';
      if (key === 'timeAveraging.0') return 'seconds';
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

describe('<TimeAveraging />', () => {
  test('renders formatted units and expected dropdown options', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={1} />
      </StoreProvider>
    );

    const dropdown = screen.getByTestId('timeAveraging');
    expect(dropdown).toHaveAttribute('data-label', 'Time averaging');
    expect(dropdown).toHaveAttribute('data-value', '1');
    expect(screen.getByText('seconds')).toBeInTheDocument();

    const options = JSON.parse(dropdown.getAttribute('data-options') || '[]') as Array<{
      label: string;
      value: number;
    }>;

    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ label: '0.849', value: 1 });
    expect(options[11]).toEqual({ label: '10.192', value: 12 });
  });

  test('passes disabled state to dropdown', () => {
    render(
      <StoreProvider>
        <TimeAveraging value={2} disabled />
      </StoreProvider>
    );

    expect(screen.getByTestId('timeAveraging')).toHaveAttribute('data-disabled', 'true');
  });
});
