import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PulsarTimingBeamField from '@/components/fields/pulsarTimingBeam/PulsarTimingBeam';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('PulsarTimingBeamField', () => {
  it('renders without crashing', () => {
    wrapper(<PulsarTimingBeamField />);
    expect(screen.getByTestId('NoBeamTestId')).toBeInTheDocument();
    expect(screen.getByTestId('MultipleBeamsTestId')).toBeInTheDocument();
  });

  it('displays the Add button when "multipleBeams" is selected', () => {
    wrapper(<PulsarTimingBeamField />);
    const multipleBeamsRadio = screen.getByTestId('MultipleBeamsTestId');
    fireEvent.click(multipleBeamsRadio);
    expect(screen.getByTestId('addPulsarTimingBeamButton')).toBeInTheDocument();
  });

  it('resets beam data when resetBeamData is true', () => {
    const { rerender } = render(
      <StoreProvider>
        <AppFlowProvider>
          <PulsarTimingBeamField resetBeamData={false} />
        </AppFlowProvider>
      </StoreProvider>
    );
    rerender(
      <StoreProvider>
        <AppFlowProvider>
          <PulsarTimingBeamField resetBeamData={true} />
        </AppFlowProvider>
      </StoreProvider>
    );
    expect(screen.queryByTestId('pulsarTimingBeamColumns')).not.toBeInTheDocument();
  });

  it('calls onDialogResponse with updated beams', () => {
    const mockOnDialogResponse = vi.fn();
    wrapper(<PulsarTimingBeamField onDialogResponse={mockOnDialogResponse} />);
    fireEvent.click(screen.getByTestId('MultipleBeamsTestId'));
    expect(mockOnDialogResponse).toHaveBeenCalled();
  });
});
