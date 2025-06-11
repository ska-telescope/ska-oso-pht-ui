import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ValidationResults from './ValidationResults';

describe('<ValidationResults />', () => {
  test('renders correctly ( empty proposal', () => {
    render(<ValidationResults open={false} onClose={vi.fn()} proposal={null} results={[]} />);
  });
  test('renders correctly', () => {
    render(
      <ValidationResults
        open={false}
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
        results={['LOOKS OK', 'NO ISSUES FOUND']}
      />
    );
  });
});
