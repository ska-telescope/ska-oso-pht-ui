import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridObservationSummary from './GridObservationSummary';

describe('<GridObservationSummary />', () => {
  test('renders correctly', () => {
    render(
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
          scienceCategory: undefined,
          scienceSubCategory: undefined,
          team: undefined,
          abstract: undefined,
          sciencePDF: undefined,
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
              imageWeighting: 0,
              robust: 0,
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
          technicalPDF: undefined,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
      />
    );
  });
  test('renders correctly ( no observations )', () => {
    render(
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
          scienceCategory: undefined,
          scienceSubCategory: undefined,
          team: undefined,
          abstract: undefined,
          sciencePDF: undefined,
          scienceLoadStatus: undefined,
          targetOption: undefined,
          targets: undefined,
          observations: [],
          groupObservations: undefined,
          targetObservation: undefined,
          technicalPDF: undefined,
          technicalLoadStatus: undefined,
          dataProductSDP: undefined,
          dataProductSRC: undefined,
          pipeline: undefined
        }}
      />
    );
  });
});
