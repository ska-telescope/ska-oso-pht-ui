import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConflictConfirmation from './ConflictConfirmation';

describe('<ConflictConfirmation />', () => {
  const mockActionConfirm = vi.fn();
  const mockActionClose = vi.fn();
  test('renders if null proposal', () => {
    render(
      <ConflictConfirmation proposal={null} open={false} onClose={vi.fn()} onConfirm={vi.fn()} />
    );
  });
  test('renders correctly', () => {
    render(
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
    );
  });
});
