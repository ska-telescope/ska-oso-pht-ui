import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { Sensitivity, SensitivityValues } from '@/models/proposals/targetObservation';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import { dataProductToLegacy } from '@/models/proposals/useCopySlicesToStore';
import {
  REFERENCE_COORDINATE_TYPE_SSO,
  SENSITIVITY_STATE,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM
} from '@/utils/constants.ts';
import DataProductInPlace from './DataProductInPlace';

// --- Mocks ---
vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
const mockOsdCyclePolicy = { maxObservations: 1, maxDataProducts: 1 };
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ osdCyclePolicy: mockOsdCyclePolicy })
}));

let mockStoreReturn: any;
vi.mock('@utils/storage/store', () => ({
  storageObject: { useStore: () => mockStoreReturn }
}));

let mockId = 0;
vi.mock('@/utils/helpers', () => ({
  generateId: () => 'SDP000001',
  generateDataProductId: () => `new-dp-${++mockId}`,
  convertFrequencyToDisplayUnits: (value: number, unit: string) => ({ value, unit }),
  getSpectralResolutionHz: () => 1000000,
  frequencyConversion: (value: number) => value
}));

// Lightweight mocks for child components
vi.mock('@/components/grid/observation/GridObservation', () => ({
  default: (props: any) => (
    <div data-testid="GridObservation">
      {props.data.map((obs: any) => (
        <div key={obs.id} onClick={() => props.rowClick({ row: obs })}>
          Observation {obs.id}
        </div>
      ))}
    </div>
  )
}));
vi.mock('@/components/button/Add/Add', () => ({
  default: (props: any) => (
    <button data-testid={props.testId} onClick={props.action} disabled={props.disabled}>
      {props.title}
    </button>
  )
}));

const theme = createTheme();

// The images or visibilities choice of a continuum observation
const productType = () => screen.getByRole('combobox', { name: 'dataProductType.label' });
const IMAGES = 'dataProductType.options.continuum.1';
const VISIBILITIES = 'dataProductType.options.continuum.2';

const values = ({
  weighted,
  beamSize = '1.00 x 2.00'
}: {
  weighted: number;
  beamSize?: string;
}): SensitivityValues => ({
  weightedSensitivity: { value: weighted, unit: 'Jy/beam' },
  totalSensitivity: { value: 3, unit: 'Jy/beam' },
  confusionNoise: { value: 2, unit: 'Jy/beam' },
  surfaceBrightnessSensitivity: { value: 4, unit: 'K' },
  synthesizedBeamSize: { value: beamSize, unit: 'arcsec2' }
});

const DONE: Sensitivity = {
  state: SENSITIVITY_STATE.DONE,
  continuum: values({ weighted: 1 }),
  spectral: values({ weighted: 2 })
};

const observation = (type: string, extra: object = {}) => ({
  id: 'OBS1',
  type,
  observingBand: 'low',
  centralFrequency: 1,
  centralFrequencyUnits: 'Hz',
  supplied: { value: 1 },
  continuumBandwidth: 1,
  continuumBandwidthUnits: 2,
  bandwidth: 1,
  ...extra
});

const image = (kind: string, extra: object = {}) =>
  ({
    id: 'DP1',
    observationId: 'OBS1',
    kind,
    imageSize: { value: 1, unit: 'deg' },
    pixelSize: { value: 1, unit: 'arcsec' },
    weighting: 'briggs',
    robust: 0,
    taper: 0,
    polarisations: ['I'],
    channelsOut: 10,
    ...(kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE && { continuumSubtraction: true }),
    ...extra
  }) as DataProductInput;

const visibilities = {
  id: 'DP2',
  observationId: 'OBS1',
  kind: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES,
  timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
  frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
} as DataProductInput;

const link = (sensitivity?: Sensitivity) => ({
  observationId: 'OBS1',
  dataProductsSDPId: 'DP1',
  targetId: 'T1',
  sensitivity
});

// The store the form is seeded from. The sensitivity results still read the data products' legacy
// copy from it, so it holds that too.
const openProposal = (proposal: {
  observations: object[];
  dataProducts: DataProductInput[];
  targetObservation?: object[];
  targets?: object[];
}) => {
  mockStoreReturn = {
    application: {
      content2: {
        id: 'prsl-1',
        targets: [],
        targetObservation: [],
        ...proposal,
        dataProductSDP: proposal.dataProducts.map(dataProductToLegacy)
      }
    },
    updateAppContent2: vi.fn()
  };
};

// The proposal the form last copied into the store
const storedProposal = () => mockStoreReturn.updateAppContent2.mock.calls.at(-1)?.[0];

const renderPage = () =>
  render(
    <TestProposalFormProvider>
      <ThemeProvider theme={theme}>
        <DataProductInPlace observation={mockStoreReturn.application.content2.observations[0]} />
      </ThemeProvider>
    </TestProposalFormProvider>
  );

beforeEach(() => {
  mockId = 0;
});

describe('DataProductInPlace', () => {
  it('shows the linked data product and its results without changing them', () => {
    const dataProducts = [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE), visibilities];
    openProposal({
      observations: [observation(TYPE_CONTINUUM)],
      dataProducts,
      targetObservation: [link(DONE)]
    });
    renderPage();

    expect(productType()).toHaveTextContent(IMAGES);
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toHaveTextContent('1');
    // The store copy may fill in other subgroups, but the data products and results are as loaded
    expect(storedProposal()?.dataProducts ?? dataProducts).toEqual(dataProducts);
    expect(storedProposal()?.targetObservation[0].sensitivity ?? DONE).toEqual(DONE);
  });

  it("shows the observation's main data product before there is a link", () => {
    openProposal({
      observations: [observation(TYPE_CONTINUUM)],
      dataProducts: [visibilities, image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)]
    });
    renderPage();

    expect(productType()).toHaveTextContent(VISIBILITIES);
  });

  it('offers images or visibilities only for a continuum observation', () => {
    // A continuum-spectral observation's visibilities are its hidden companion, not a choice
    openProposal({
      observations: [observation(TYPE_CONTINUUM_SPECTRAL)],
      dataProducts: [visibilities, image(DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE)]
    });
    renderPage();

    expect(
      screen.queryByRole('combobox', { name: 'dataProductType.label' })
    ).not.toBeInTheDocument();
  });

  it('makes the visibilities the main data product when the user switches to them', async () => {
    openProposal({
      observations: [observation(TYPE_CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { channelsOut: 3 }), visibilities],
      targetObservation: [link(DONE)]
    });
    renderPage();

    fireEvent.mouseDown(productType());
    fireEvent.click(screen.getByRole('option', { name: VISIBILITIES }));

    await waitFor(() => expect(storedProposal()).toBeDefined());
    expect(storedProposal().dataProducts.map((dp: DataProductInput) => dp.id)).toEqual([
      'DP2',
      'DP1'
    ]);
    // The images data product is a hidden companion again, with its defaults back
    expect(storedProposal().dataProducts[1]).toMatchObject({ id: 'DP1', channelsOut: 10 });
    expect(storedProposal().targetObservation[0]).toMatchObject({
      dataProductsSDPId: 'DP2',
      sensitivity: { state: SENSITIVITY_STATE.CALCULATING }
    });
  });

  it('hides continuum spectral results when only one output channel is selected', () => {
    openProposal({
      observations: [observation(TYPE_CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { channelsOut: 1 })],
      targetObservation: [link(DONE)]
    });
    renderPage();

    expect(
      screen.getByText('sensitivityCalculatorResults.title (Imaging ODP)')
    ).toBeInTheDocument();
    expect(screen.getByTestId('field-continuumSensitivityWeighted')).toBeInTheDocument();
    expect(screen.queryByTestId('field-spectralSensitivityWeighted')).not.toBeInTheDocument();
  });

  describe('when the sensitivity calculator does not apply', () => {
    it('reports PST as unsupported', () => {
      openProposal({
        observations: [observation(TYPE_PST)],
        dataProducts: [{ id: 'DP1', observationId: 'OBS1', kind: DATA_PRODUCT_KIND.PST_TIMING }]
      });
      renderPage();

      expect(screen.getByText('page.7.pstUnavailable')).toBeInTheDocument();
    });

    it('asks for a target when none is linked', () => {
      openProposal({
        observations: [observation(TYPE_CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)]
      });
      renderPage();

      expect(screen.getByText('sensitivityCalculatorResults.noTarget')).toBeInTheDocument();
    });

    it('reports SSO targets as unsupported', () => {
      openProposal({
        observations: [observation(TYPE_CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE)],
        targetObservation: [link({ state: SENSITIVITY_STATE.CALCULATING })],
        targets: [
          {
            id: 'T1',
            name: 'Jupiter',
            kind: REFERENCE_COORDINATE_TYPE_SSO.value,
            velocityDefinition: 'RADIO'
          }
        ]
      });
      renderPage();

      expect(
        screen.getByText('sensitivityCalculatorResults.notApplicableForSSO')
      ).toBeInTheDocument();
    });
  });

  it.each([
    [TYPE_CONTINUUM, DATA_PRODUCT_KIND.CONTINUUM_IMAGE],
    [TYPE_ZOOM, DATA_PRODUCT_KIND.SPECTRAL_IMAGE],
    [TYPE_CONTINUUM_SPECTRAL, DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE]
  ])('shows the robust field for briggs weighting in %s', (type, kind) => {
    openProposal({ observations: [observation(type)], dataProducts: [image(kind)] });
    renderPage();

    expect(screen.getByLabelText('robust.label')).toBeInTheDocument();
  });

  it('hides the robust field for other weightings', () => {
    openProposal({
      observations: [observation(TYPE_CONTINUUM)],
      dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { weighting: 'natural' })]
    });
    renderPage();

    expect(screen.queryByLabelText('robust.label')).not.toBeInTheDocument();
  });

  it.each([
    ['briggs', 2, true],
    ['uniform', 2, false]
  ])(
    'shows non-Gaussian results for %s weighting with robust %i: %s',
    (weighting, robust, shown) => {
      openProposal({
        observations: [observation(TYPE_CONTINUUM)],
        dataProducts: [image(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, { weighting, robust })],
        targetObservation: [
          link({
            state: SENSITIVITY_STATE.DONE,
            continuum: values({ weighted: 7.18, beamSize: '0' }),
            spectral: values({ weighted: 1 })
          })
        ]
      });
      renderPage();

      const beamSize = screen.getByTestId('field-continuumSynthBeamSize');
      if (shown) {
        expect(beamSize).toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
      } else {
        expect(beamSize).not.toHaveTextContent('sensitivityCalculatorResults.nonGaussian');
      }
    }
  );

  // A whole number of steps from the backend is shown to the field's decimal places
  it('shows the detected filterbank resolution and sampling interval rounded', () => {
    openProposal({
      observations: [observation(TYPE_PST, { pstMode: 1 })],
      dataProducts: [
        {
          id: 'DP1',
          observationId: 'OBS1',
          kind: DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK,
          polarisations: ['I'],
          bitDepth: 8,
          outputFrequencyResolutionKhz: steppedFromPdm(
            1,
            STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
          ),
          outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
          dispersionMeasure: 0,
          rotationMeasure: 0
        } as DataProductInput
      ]
    });
    renderPage();

    expect(screen.getByRole('spinbutton', { name: 'outputFrequencyResolution.label' })).toHaveValue(
      3.62
    );
    expect(screen.getByRole('spinbutton', { name: 'outputSamplingInterval.label' })).toHaveValue(
      0.207
    );
  });

  it.each([
    [DATA_PRODUCT_KIND.PST_FLOW_THROUGH, 0, ['1', '2', '4', '8', '16'], ['X', 'Y']],
    [DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK, 1, ['1', '2', '4', '8'], ['I', 'Q', 'U', 'V']]
  ])(
    'gives %s its bit depth and polarisation options and description',
    (kind, pstMode, options, polarisations) => {
      openProposal({
        observations: [observation(TYPE_PST, { pstMode })],
        dataProducts: [
          {
            id: 'DP1',
            observationId: 'OBS1',
            kind,
            polarisations: [polarisations[0]],
            bitDepth: 8,
            outputFrequencyResolutionKhz: steppedFromPdm(
              1,
              STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
            ),
            outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
            dispersionMeasure: 0,
            rotationMeasure: 0
          } as DataProductInput
        ]
      });
      renderPage();

      expect(
        screen.getAllByRole('checkbox').map((box) => box.closest('label')?.textContent)
      ).toEqual(polarisations.map((value) => 'polarisations.' + value));
      expect(screen.getByLabelText('polarisations.' + polarisations[0])).toBeChecked();

      // The bit depth is the only list on the page
      fireEvent.mouseDown(screen.getByRole('combobox'));
      expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(options);
      expect(screen.getByRole('option', { selected: true })).toHaveTextContent('8');
      expect(screen.getByText(`page.7.descContent.${kind}`)).toBeInTheDocument();
    }
  );
});
