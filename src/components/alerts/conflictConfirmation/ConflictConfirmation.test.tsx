import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ConflictConfirmation from './ConflictConfirmation';

describe('<ConflictConfirmation />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    render(
      <StoreProvider>
        <ConflictConfirmation proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
      </StoreProvider>
    );
  });
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ConflictConfirmation
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
            investigators: undefined,
            abstract: 'This is an abstract for a proposal.',
            sciencePDF: null,
            scienceLoadStatus: undefined,
            targetOption: undefined,
            targets: undefined,
            observations: undefined,
            groupObservations: undefined,
            targetObservation: undefined,
            technicalPDF: null,
            technicalLoadStatus: undefined,
            dataProductSDP: undefined,
            dataProductSRC: undefined,
            pipeline: undefined
          }}
          open={true}
          onClose={mockActionClose}
          onConfirm={mockActionConfirm}
        />
      </StoreProvider>
    );
  });
});
