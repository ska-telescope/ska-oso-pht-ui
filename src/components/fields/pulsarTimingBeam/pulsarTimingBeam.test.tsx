import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PulsarTimingBeamField from '@/components/fields/pulsarTimingBeam/PulsarTimingBeam';

describe('PulsarTimingBeamField', () => {
  it('renders without crashing', () => {
    render(
      <StoreProvider>
        <PulsarTimingBeamField />
      </StoreProvider>
    );
    expect(screen.getByTestId('NoBeamTestId')).toBeInTheDocument();
    expect(screen.getByTestId('MultipleBeamsTestId')).toBeInTheDocument();
  });

  it('displays the Add button when "multipleBeams" is selected', () => {
    render(
      <StoreProvider>
        <PulsarTimingBeamField />
      </StoreProvider>
    );
    const multipleBeamsRadio = screen.getByTestId('MultipleBeamsTestId');
    fireEvent.click(multipleBeamsRadio);
    expect(screen.getByTestId('addPulsarTimingBeamButton')).toBeInTheDocument();
  });

  it('resets beam data when resetBeamData is true', () => {
    const { rerender } = render(
      <StoreProvider>
        <PulsarTimingBeamField resetBeamData={false} />
      </StoreProvider>
    );
    rerender(
      <StoreProvider>
        <PulsarTimingBeamField resetBeamData={true} />
      </StoreProvider>
    );
    expect(screen.queryByTestId('pulsarTimingBeamColumns')).not.toBeInTheDocument();
  });

  it('calls onDialogResponse with updated beams', () => {
    const mockOnDialogResponse = vi.fn();
    render(
      <StoreProvider>
        <PulsarTimingBeamField onDialogResponse={mockOnDialogResponse} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('MultipleBeamsTestId'));
    expect(mockOnDialogResponse).toHaveBeenCalled();
  });
});
