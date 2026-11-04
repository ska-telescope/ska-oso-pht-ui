import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardChip from './standardChip';

// Mock StatusIconDisplay
vi.mock('../../../components/icon/status/statusIcon', () => ({
  default: () => <div>Icon</div>
}));

describe('StandardChip', () => {
  it('renders with correct label and icon', () => {
    render(<StandardChip color={AlertColorTypes.Success} text="Chip Text" />);

    expect(screen.getByText('Chip Text')).toBeInTheDocument();
  });
});
