import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import GridObservationSummary from './GridObservationSummary';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<GridObservationSummary />', () => {
  test('renders correctly', () => {
    wrapper(
      <GridObservationSummary
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
          observations: [
            {
              id: '',
              telescope: 0,
              subarray: 0,
              linked: '',
              type: 0,
              observingBand: 0,
              elevation: 0,
              centralFrequency: 0,
              centralFrequencyUnits: 0,
              bandwidth: 0,
              continuumBandwidth: 0,
              continuumBandwidthUnits: 0,
              supplied: {
                type: 0,
                value: 0,
                units: 0
              },
              spectralResolution: '',
              effectiveResolution: ''
            }
          ],
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: null,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
      />
    );
  });
  test('renders correctly ( no observations )', () => {
    wrapper(
      <GridObservationSummary
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
          observations: [],
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: null,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
      />
    );
  });
});
