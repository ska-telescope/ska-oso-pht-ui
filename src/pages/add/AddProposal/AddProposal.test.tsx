import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddProposal from './AddProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    wrapper(<AddProposal />);
    // Example assertion: adjust to match actual UI
    // expect(screen.getByText(/Add Proposal/i)).toBeInTheDocument();
  });

  test('renders correctly when linking disabled', () => {
    wrapper(<AddProposal />);
    // assertions for disabled linking scenario
  });
});
