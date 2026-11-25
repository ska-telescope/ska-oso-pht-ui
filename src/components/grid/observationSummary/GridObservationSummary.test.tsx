import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import GridObservationSummary from './GridObservationSummary';
import { getProposalFormDefaults } from '@/models/proposals/useProposalForm';
import { newSvObservation, OBSERVING_MODE } from '@/models/proposals/observations';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<GridObservationSummary />', () => {
  test('renders the observations from the form', () => {
    const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, null);
    wrapper(
      <GridObservationSummary
        proposal={{
          ...getProposalFormDefaults(),
          targets: [{ id: 'T1', name: 'Target 1' } as any],
          targetObservation: [
            { targetId: 'T1', observationId: observation.id, dataProductsSDPId: 'DP1' }
          ],
          observations: [observation]
        }}
      />
    );
    expect(screen.getByText('Target 1')).toBeInTheDocument();
    expect(screen.getByText('observationType.continuum')).toBeInTheDocument();
    expect(screen.getByText('1 h')).toBeInTheDocument();
  });

  test('renders correctly ( no observations )', () => {
    wrapper(<GridObservationSummary proposal={getProposalFormDefaults()} />);
    expect(screen.getByTestId('noObservationsNotification')).toBeInTheDocument();
  });
});
