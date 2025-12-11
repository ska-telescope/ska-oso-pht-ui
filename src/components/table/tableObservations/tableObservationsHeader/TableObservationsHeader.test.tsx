import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableObservationsHeader from './TableObservationsHeader';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TableObservationsHeader', () => {
  it('renders all expected table headers', () => {
    wrapper(<TableObservationsHeader />);

    expect(screen.getByText(/actions.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observationType.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observationId.label/i)).toBeInTheDocument();
    expect(screen.getByText(/subArrayConfiguration.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observingBand.label/i)).toBeInTheDocument();
  });
});
