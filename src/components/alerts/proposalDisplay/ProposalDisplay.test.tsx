import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ProposalDisplay from './ProposalDisplay';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<ProposalDisplay />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    wrapper(<ProposalDisplay proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
  });
  test('renders correctly ( type 0 )', () => {
    wrapper(
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
          scienceCategory: null,
          scienceSubCategory: undefined,
          investigators: undefined,
          abstract: undefined,
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
    );
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockActionClose).toBeCalled();
  });
  test('renders correctly ( type 1 )', () => {
    wrapper(
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
    );
  });
});
