import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardChip from './standardChip';

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock StatusIconDisplay
vi.mock('../../../components/icon/status/statusIcon', () => ({
  default: ({ testId }: { testId: string }) => <div data-testid={testId}>Icon</div>
}));

describe('StandardChip', () => {
  it('renders with correct label and icon', () => {
    render(<StandardChip color={AlertColorTypes.Success} testId="test-chip" text="Chip Text" />);

    expect(screen.getByTestId('test-chip')).toBeInTheDocument();
    expect(screen.getByText('Chip Text')).toBeInTheDocument();
    expect(screen.getByTestId('test-chipIcon')).toBeInTheDocument();
  });

  it('calls closeFunc and unmounts after delete', async () => {
    const closeFunc = vi.fn();

    render(
      <StandardChip
        color={AlertColorTypes.Error}
        testId="closable-chip"
        text="Closable Chip"
        closeFunc={closeFunc}
        fadeDuration={100}
      />
    );

    const chip = screen.getByTestId('closable-chip');
    expect(chip).toBeInTheDocument();

    const icon = chip.querySelector('svg');
    if (icon) {
      fireEvent.click(icon);
    }

    await waitFor(() => {
      expect(closeFunc).toHaveBeenCalled();
      expect(screen.queryByTestId('closable-chip')).not.toBeInTheDocument();
    });
  });

  it('does not crash without closeFunc', async () => {
    render(
      <StandardChip
        color={AlertColorTypes.Warning}
        testId="no-close-chip"
        text="No Close"
        fadeDuration={50}
      />
    );

    const chip = screen.getByTestId('no-close-chip');
    const icon = chip.querySelector('svg');
    if (icon) {
      fireEvent.click(icon);
    }

    await waitFor(() => {
      expect(screen.queryByTestId('no-close-chip')).not.toBeInTheDocument();
    });
  });
});
