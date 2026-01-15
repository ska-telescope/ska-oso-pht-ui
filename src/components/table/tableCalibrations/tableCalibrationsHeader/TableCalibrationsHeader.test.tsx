import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableCalibrationsHeader from './TableCalibrationsHeader';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('TableCalibrationsHeader', () => {
  it('renders all expected table headers', () => {
    wrapper(<TableCalibrationsHeader />);

    expect(screen.getByText(/actions.label/i)).toBeInTheDocument();
    expect(screen.getByText(/observationId.label/i)).toBeInTheDocument();
    // expect(screen.getByText(/observationType.label/i)).toBeInTheDocument();
    // expect(screen.getByText(/subArrayConfiguration.label/i)).toBeInTheDocument();
    // expect(screen.getByText(/observingBand.label/i)).toBeInTheDocument();
  });
});
