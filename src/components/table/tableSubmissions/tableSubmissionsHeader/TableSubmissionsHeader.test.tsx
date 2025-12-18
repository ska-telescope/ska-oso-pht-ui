import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TableSubmissionsHeader from './TableSubmissionsHeader';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TableSubmissionsHeader', () => {
  it('renders all expected table headers', () => {
    wrapper(<TableSubmissionsHeader />);

    expect(screen.getByText(/actions.label/i)).toBeInTheDocument();
    expect(screen.getByText(/proposalId.label/i)).toBeInTheDocument();
    expect(screen.getByText(/cycle.label/i)).toBeInTheDocument();
    expect(screen.getByText(/title.label/i)).toBeInTheDocument();
    expect(screen.getByText(/proposalType.label/i)).toBeInTheDocument();
    expect(screen.getByText(/status.label/i)).toBeInTheDocument();
    expect(screen.getByText(/updated.label/i)).toBeInTheDocument();
    expect(screen.getByText(/cycleCloses.label/i)).toBeInTheDocument();
  });
});
