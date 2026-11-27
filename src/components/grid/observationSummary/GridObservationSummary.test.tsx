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

  test('renders an empty cell for an observation with no band', () => {
    const observation = newSvObservation(OBSERVING_MODE.CONTINUUM, null);
    const proposalWith = (obs: typeof observation) => ({
      ...getProposalFormDefaults(),
      targets: [{ id: 'T1', name: 'Target 1' } as any],
      targetObservation: [{ targetId: 'T1', observationId: obs.id, dataProductsSDPId: 'DP1' }],
      observations: [obs]
    });
    // Other cells in the row may be empty too, so compare with the same row with its band
    const { unmount } = wrapper(<GridObservationSummary proposal={proposalWith(observation)} />);
    const emptyWithBand = screen.queryAllByTestId('emptyCell').length;
    unmount();

    wrapper(
      <GridObservationSummary proposal={proposalWith({ ...observation, observingBand: null })} />
    );
    expect(screen.queryAllByTestId('emptyCell')).toHaveLength(emptyWithBand + 1);
    expect(screen.queryByText(/observingBand\.short\./)).not.toBeInTheDocument();
  });

  test('renders correctly ( no observations )', () => {
    wrapper(<GridObservationSummary proposal={getProposalFormDefaults()} />);
    expect(screen.getByTestId('noObservationsNotification')).toBeInTheDocument();
  });
});
