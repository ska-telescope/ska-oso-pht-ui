import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import GridObservationSummary from './GridObservationSummary';
import {
  BAND_LOW_STR,
  SENSITIVITY_STATE,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TIME_DAYS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_ZOOM,
  TYPE_ZOOM_LONG
} from '@/utils/constants';
import { MockProposalFrontend } from '@/services/axios/get/getProposal/mockProposalFrontend';
import type { Sensitivity } from '@/models/proposals/targetObservation';

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
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
          proposalType: undefined,
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
              subarray: '',
              type: TYPE_CONTINUUM,
              observingBand: BAND_LOW_STR,
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
          calibrationStrategy: [],
          technicalPDF: null,
          technicalLoadStatus: undefined,
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
          proposalType: undefined,
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
          calibrationStrategy: [],
          technicalPDF: null,
          technicalLoadStatus: undefined,
          pipeline: undefined
        }}
      />
    );
  });
});

test.each([
  [SUPPLIED_TYPE_SENSITIVITY, '-'],
  [SUPPLIED_TYPE_INTEGRATION, '24 h']
])('displays integration time for supplied type %s', (type, expected) => {
  const { container } = wrapper(
    <GridObservationSummary
      proposal={{
        ...MockProposalFrontend,
        observations: [
          {
            ...MockProposalFrontend.observations![0],
            supplied: { type, value: 1, units: TIME_DAYS }
          }
        ]
      }}
    />
  );
  // Unit ID 1 is shared by days and Jy/beam; only time inputs may be converted.
  expect(container.querySelector('[role="gridcell"][data-field="weather"]')).toHaveTextContent(
    expected
  );
});

const continuum = { weightedSensitivity: { value: 12, unit: 'Jy' } };
const spectral = { weightedSensitivity: { value: 34, unit: 'Jy' } };

const renderSensitivity = (type: string, sensitivity: Sensitivity, observationId = 'summary-obs') =>
  wrapper(
    <GridObservationSummary
      proposal={{
        ...MockProposalFrontend,
        observations: [{ ...MockProposalFrontend.observations![0], id: 'summary-obs', type }],
        targetObservation: [{ targetId: 't1', observationId, dataProductsSDPId: '', sensitivity }]
      }}
    />
  );

describe.each([TYPE_CONTINUUM_SPECTRAL, TYPE_CONTINUUM_SPECTRAL_LONG])(
  '%s sensitivities',
  (type) => {
    test.each([
      [continuum, spectral, true, true],
      [continuum, undefined, true, false],
      [undefined, spectral, false, true],
      [undefined, undefined, false, false]
    ])(
      'renders available DONE parts (%j, %j)',
      (continuum, spectral, hasContinuum, hasSpectral) => {
        // Exercise partial calculator results, including a missing spectral part.
        renderSensitivity(type, {
          state: SENSITIVITY_STATE.DONE,
          continuum,
          spectral
        } as Sensitivity);
        expect(screen.queryByText('observationType.continuum: 12.00 Jy') !== null).toBe(
          hasContinuum
        );
        expect(screen.queryByText('observationType.spectral: 34.00 Jy') !== null).toBe(hasSpectral);
      }
    );

    test.each([SENSITIVITY_STATE.CALCULATING, SENSITIVITY_STATE.FAILED])(
      'does not render results for %s links',
      (state) => {
        renderSensitivity(type, { state, error: 'Failed', continuum, spectral } as Sensitivity);
        expect(
          screen.queryByText(/observationType\.(continuum|spectral):/)
        ).not.toBeInTheDocument();
      }
    );

    test('ignores results linked to another observation', () => {
      renderSensitivity(type, { state: SENSITIVITY_STATE.DONE, continuum, spectral }, 'other-obs');
      expect(screen.queryByText(/observationType\.(continuum|spectral):/)).not.toBeInTheDocument();
    });
  }
);

test.each([TYPE_CONTINUUM, TYPE_ZOOM, TYPE_ZOOM_LONG])(
  '%s retains its existing sensitivity',
  (type) => {
    renderSensitivity(type, { state: SENSITIVITY_STATE.DONE, continuum, spectral });
    expect(screen.queryByText('observationType.continuum: 12.00 Jy') !== null).toBe(
      type === TYPE_CONTINUUM
    );
    expect(screen.queryByText('observationType.spectral: 34.00 Jy') !== null).toBe(
      type !== TYPE_CONTINUUM
    );
  }
);

test.each([199.609375, 199.609375123456])(
  'displays the saved central frequency precision for %s MHz',
  (centralFrequency) => {
    wrapper(
      <GridObservationSummary
        proposal={{
          ...MockProposalFrontend,
          observations: [{ ...MockProposalFrontend.observations![0], centralFrequency }]
        }}
      />
    );
    expect(screen.getByText(`${centralFrequency} MHz`)).toBeInTheDocument();
  }
);
