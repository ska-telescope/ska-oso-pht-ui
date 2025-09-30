import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
