import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableDataProductsHeader from './TableDataProductsHeader';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TableDataProductsHeader', () => {
  it('renders all expected table headers', () => {
    wrapper(<TableDataProductsHeader />);

    expect(screen.getByText(/actions.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observationType.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observationId.label/i)).toBeInTheDocument();
    expect(screen.getByText(/subArrayConfiguration.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observingBand.label/i)).toBeInTheDocument();
    // expect(screen.getByText(/imageWeighting.label/i)).toBeInTheDocument();
  });
});
