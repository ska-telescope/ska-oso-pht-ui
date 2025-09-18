import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ProposalDisplay from './ProposalDisplay';

describe('<ProposalDisplay />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    render(
      <StoreProvider>
        <ProposalDisplay proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
      </StoreProvider>
    );
  });
  test('renders correctly ( type 0 )', () => {
    render(
      <StoreProvider>
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
            investigators: undefined,
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
          open={true}
          onClose={mockActionClose}
          onConfirm={mockActionConfirm}
        />
      </StoreProvider>
    );
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockActionClose).toBeCalled();
  });
  test('renders correctly ( type 1 )', () => {
    render(
      <StoreProvider>
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
            investigators: undefined,
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
          open={true}
          onClose={mockActionClose}
          onConfirm={mockActionConfirm}
        />
      </StoreProvider>
    );
    // screen.getByTestId('displayConfirmationButton').click();
    // expect(mockActionConfirm).toBeCalled();
  });
});
