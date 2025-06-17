import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProposalDisplay from './ProposalDisplay';

describe('<ProposalDisplay />', () => {
  test('renders if null proposal', () => {
    render(<ProposalDisplay proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
  });
  test('renders correctly ( type 0 )', () => {
    render(
      <ProposalDisplay
        proposal={{
          id: '',
          title: '',
          status: '',
          lastUpdated: '',
          lastUpdatedBy: '',
          createdOn: '',
          createdBy: '',
          version: 0,
          cycle: '',
          proposalType: 0,
          proposalSubType: undefined,
          scienceCategory: undefined,
          scienceSubCategory: undefined,
          team: undefined,
          abstract: undefined,
          sciencePDF: undefined,
          scienceLoadStatus: undefined,
          targetOption: undefined,
          targets: undefined,
          observations: undefined,
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: undefined,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
  });
  test('renders correctly ( type 1 )', () => {
    render(
      <ProposalDisplay
        proposal={{
          id: '',
          title: '',
          status: '',
          lastUpdated: '',
          lastUpdatedBy: '',
          createdOn: '',
          createdBy: '',
          version: 0,
          cycle: '',
          proposalType: 1,
          proposalSubType: [1],
          scienceCategory: 1,
          scienceSubCategory: undefined,
          team: undefined,
          abstract: 'This is an abstract for a proposal.',
          sciencePDF: undefined,
          scienceLoadStatus: undefined,
          targetOption: undefined,
          targets: undefined,
          observations: undefined,
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: undefined,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
  });
});
