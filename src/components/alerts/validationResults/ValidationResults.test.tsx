import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationResults from './ValidationResults';

describe('<ValidationResults />', () => {
  test('renders correctly ( empty proposal', () => {
    const mockActionClose = vi.fn();
    render(
      <ValidationResults open={false} onClose={mockActionClose} proposal={null} results={[]} />
    );
  });
  test('renders correctly', () => {
    render(
      <ValidationResults
        open={true}
        onClose={vi.fn()}
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
          team: undefined,
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
        results={['LOOKS OK', 'NO ISSUES FOUND']}
      />
    );
    screen.queryByTestId('cancelButtonTestId')?.click();
  });
});
