import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ValidationResults from './ValidationResults';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('<ValidationResults />', () => {
  test('renders correctly ( empty proposal', () => {
    const mockActionClose = vi.fn();
    wrapper(
      <ValidationResults open={false} onClose={mockActionClose} proposal={null} results={[]} />
    );
  });
  test('renders correctly', () => {
    wrapper(
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
          scienceCategory: 0,
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
          pipeline: undefined,
          calibrationStrategy: []
        }}
        results={['LOOKS OK', 'NO ISSUES FOUND']}
      />
    );
    screen.queryByTestId('cancelButtonTestId')?.click();
  });
});
