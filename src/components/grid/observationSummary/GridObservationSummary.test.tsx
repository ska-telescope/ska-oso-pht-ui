import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import GridObservationSummary from './GridObservationSummary';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  FREQUENCY_MHZ,
  SENSITIVITY_STATE,
  SUPPLIED_TYPE_INTEGRATION,
  SUPPLIED_TYPE_SENSITIVITY,
  TIME_DAYS,
  TIME_HOURS,
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
              spectralResolution: ''
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
  expect(
    container.querySelector('[role="gridcell"][data-field="integrationTime"]')
  ).toHaveTextContent(expected);
});

test('sorts integration time by numeric hours', () => {
  const { container } = wrapper(
    <GridObservationSummary
      proposal={{
        ...MockProposalFrontend,
        observations: [
          {
            ...MockProposalFrontend.observations![0],
            id: 'one-day',
            supplied: { type: SUPPLIED_TYPE_INTEGRATION, value: 1, units: TIME_DAYS }
          },
          {
            ...MockProposalFrontend.observations![0],
            id: 'two-hours',
            supplied: { type: SUPPLIED_TYPE_INTEGRATION, value: 2, units: TIME_HOURS }
          }
        ]
      }}
    />
  );
  const header = container.querySelector('[role="columnheader"][data-field="integrationTime"]');
  expect(header).toBeInTheDocument();
  if (header) fireEvent.click(header);

  const rowIds = Array.from(container.querySelectorAll('[role="row"][data-id]')).map((row) =>
    row.getAttribute('data-id')
  );
  expect(rowIds).toEqual(['two-hours', 'one-day']);
});

const continuum = { weightedSensitivity: { value: 12, unit: 'Jy' } };
const spectral = { weightedSensitivity: { value: 34, unit: 'Jy' } };

const renderSensitivity = (type: string, sensitivity: Sensitivity, observationId = 'summary-obs') =>
  wrapper(
    <GridObservationSummary
      proposal={{
        ...MockProposalFrontend,
        targets: [{ ...MockProposalFrontend.targets![0], id: 't1', name: 'Target One' }],
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
        expect(screen.queryByText('Target One: observationType.continuum: 12.00 Jy') !== null).toBe(
          hasContinuum
        );
        expect(screen.queryByText('Target One: observationType.spectral: 34.00 Jy') !== null).toBe(
          hasSpectral
        );
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
    expect(screen.queryByText('Target One: observationType.continuum: 12.00 Jy') !== null).toBe(
      type === TYPE_CONTINUUM
    );
    expect(screen.queryByText('Target One: observationType.spectral: 34.00 Jy') !== null).toBe(
      type !== TYPE_CONTINUUM
    );
  }
);

test('identifies each sensitivity by its linked target, including partial results', () => {
  const target = MockProposalFrontend.targets![0];
  const { container } = wrapper(
    <GridObservationSummary
      proposal={{
        ...MockProposalFrontend,
        targets: [
          { ...target, id: 'a', name: 'Target A' },
          { ...target, id: 'b', name: 'Target B' },
          { ...target, id: 'c', name: 'Target C' }
        ],
        observations: [
          {
            ...MockProposalFrontend.observations![0],
            id: 'summary-obs',
            type: TYPE_CONTINUUM_SPECTRAL
          }
        ],
        targetObservation: [
          {
            targetId: 'a',
            observationId: 'summary-obs',
            dataProductsSDPId: '',
            sensitivity: { state: SENSITIVITY_STATE.FAILED, error: 'Failed' }
          },
          {
            targetId: 'b',
            observationId: 'summary-obs',
            dataProductsSDPId: '',
            sensitivity: { state: SENSITIVITY_STATE.DONE, continuum } as Sensitivity
          },
          {
            targetId: 'c',
            observationId: 'summary-obs',
            dataProductsSDPId: '',
            sensitivity: { state: SENSITIVITY_STATE.DONE, spectral }
          },
          {
            targetId: 'missing-target',
            observationId: 'summary-obs',
            dataProductsSDPId: '',
            sensitivity: { state: SENSITIVITY_STATE.DONE, continuum, spectral }
          }
        ]
      }}
    />
  );
  const targetCell = container.querySelector('[role="gridcell"][data-field="elevation"]');
  expect(targetCell).toHaveTextContent('Target A');
  expect(targetCell).toHaveTextContent('Target B');
  expect(targetCell).toHaveTextContent('Target C');
  const sensitivityCell = container.querySelector('[role="gridcell"][data-field="sensitivity"]');
  expect(sensitivityCell).not.toHaveTextContent('Target A');
  expect(sensitivityCell).toHaveTextContent('Target B: observationType.continuum: 12.00 Jy');
  expect(sensitivityCell).toHaveTextContent('Target C: observationType.spectral: 34.00 Jy');
  expect(sensitivityCell).toHaveTextContent('missing-target: observationType.continuum: 12.00 Jy');
  expect(sensitivityCell).toHaveTextContent('missing-target: observationType.spectral: 34.00 Jy');
});

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

test('sorts central frequencies numerically in Hz while displaying saved values', () => {
  const observation = MockProposalFrontend.observations![0];
  const { container } = wrapper(
    <GridObservationSummary
      height={900}
      proposal={{
        ...MockProposalFrontend,
        observations: [
          {
            ...observation,
            id: 'ghz',
            centralFrequency: 0.2,
            centralFrequencyUnits: FREQUENCY_GHZ
          },
          {
            ...observation,
            id: 'mhz',
            centralFrequency: 150,
            centralFrequencyUnits: FREQUENCY_MHZ
          },
          { ...observation, id: 'unknown', centralFrequency: 120000000, centralFrequencyUnits: 0 },
          { ...observation, id: 'ten', centralFrequency: 10, centralFrequencyUnits: FREQUENCY_HZ },
          { ...observation, id: 'nine', centralFrequency: 9, centralFrequencyUnits: FREQUENCY_HZ },
          { ...observation, id: 'zero', centralFrequency: 0, centralFrequencyUnits: FREQUENCY_GHZ }
        ]
      }}
    />
  );
  expect(screen.getByText('0.2 GHz')).toBeInTheDocument();
  expect(screen.getByText('150 MHz')).toBeInTheDocument();
  expect(screen.getByText('120000000')).toBeInTheDocument();

  const header = container.querySelector('[role="columnheader"][data-field="centralFrequency"]');
  expect(header).toBeInTheDocument();
  const rowIds = () =>
    Array.from(container.querySelectorAll('[role="row"][data-id]')).map((row) =>
      row.getAttribute('data-id')
    );
  if (header) fireEvent.click(header);
  expect(rowIds()).toEqual(['zero', 'nine', 'ten', 'unknown', 'mhz', 'ghz']);
  if (header) fireEvent.click(header);
  expect(rowIds()).toEqual(['ghz', 'mhz', 'unknown', 'ten', 'nine', 'zero']);
});

test('sorts displayed continuum and zoom bandwidths in Hz', () => {
  const observation = MockProposalFrontend.observations![0];
  const { container } = wrapper(
    <GridObservationSummary
      height={900}
      proposal={{
        ...MockProposalFrontend,
        observations: [
          {
            ...observation,
            id: 'ghz',
            type: TYPE_CONTINUUM,
            bandwidth: null,
            continuumBandwidth: 0.2,
            continuumBandwidthUnits: FREQUENCY_GHZ
          },
          {
            ...observation,
            id: 'zoom',
            type: TYPE_ZOOM,
            bandwidth: 1,
            zoomChannels: 150000,
            spectralResolution: '1 kHz'
          },
          {
            ...observation,
            id: 'unknown',
            type: TYPE_CONTINUUM,
            bandwidth: null,
            continuumBandwidth: 120000000,
            continuumBandwidthUnits: 0
          },
          {
            ...observation,
            id: 'ninety',
            type: TYPE_CONTINUUM_SPECTRAL,
            bandwidth: null,
            continuumBandwidth: 90,
            continuumBandwidthUnits: FREQUENCY_MHZ
          },
          {
            ...observation,
            id: 'ten',
            type: TYPE_CONTINUUM,
            bandwidth: null,
            continuumBandwidth: 10,
            continuumBandwidthUnits: FREQUENCY_MHZ
          },
          {
            ...observation,
            id: 'missing',
            type: TYPE_CONTINUUM,
            bandwidth: null,
            continuumBandwidth: null,
            continuumBandwidthUnits: FREQUENCY_MHZ
          }
        ]
      }}
    />
  );
  const cell = (id: string) =>
    container.querySelector(`[role="row"][data-id="${id}"] [data-field="bandwidth"]`);
  expect(cell('ghz')).toHaveTextContent('0.20 GHz');
  expect(cell('zoom')).toHaveTextContent('150.00 MHz');
  expect(cell('unknown')).toHaveTextContent('1.2e+8');
  expect(cell('missing')).toHaveTextContent('-');

  const header = container.querySelector('[role="columnheader"][data-field="bandwidth"]');
  expect(header).toBeInTheDocument();
  const rowIds = () =>
    Array.from(container.querySelectorAll('[role="row"][data-id]')).map((row) =>
      row.getAttribute('data-id')
    );
  if (header) fireEvent.click(header);
  expect(rowIds()).toEqual(['missing', 'ten', 'ninety', 'unknown', 'zoom', 'ghz']);
  if (header) fireEvent.click(header);
  expect(rowIds()).toEqual(['ghz', 'zoom', 'unknown', 'ninety', 'ten', 'missing']);
});
