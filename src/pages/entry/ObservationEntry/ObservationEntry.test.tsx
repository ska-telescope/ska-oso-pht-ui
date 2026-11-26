import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useFormContext, UseFormReturn } from 'react-hook-form';
import TestProposalFormProvider from '@/models/proposals/testing/TestProposalFormProvider';
import { ProposalType } from '@/models/proposals/proposal';
import { storageObject, StoreProvider } from '@utils/storage/store';
import completeMockStore from '@/utils/MockStore';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  NAV,
  PAGE_OBSERVATION,
  PROPOSAL_TYPE
} from '@/utils/constants';
import ObservationEntry from './ObservationEntry';
import ObservationInPlace from '@/pages/ObservationPage/ObservationInPlace';
import {
  DATA_PRODUCT_KIND,
  newDataProduct,
  updateImageSizes
} from '@/models/proposals/dataProducts';

const mockState = vi.hoisted(() => ({
  locationState: null as unknown,
  navigate: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useLocation: () => ({ pathname: '/', state: mockState.locationState, search: '', hash: '' }),
  useNavigate: () => mockState.navigate
}));

// A cycle with LOW and MID band 5b, with the mock OSD
vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', async () => {
  const { MockObservatoryDataFrontend } = await vi.importActual<
    typeof import('@services/axios/get/getObservatoryData/mockObservatoryDataFrontend')
  >('@services/axios/get/getObservatoryData/mockObservatoryDataFrontend');
  const policy = MockObservatoryDataFrontend.policies[1];
  const capabilities = MockObservatoryDataFrontend.capabilities;
  return {
    useOSDAccessors: () => ({
      osdLOW: capabilities.low,
      osdMID: capabilities.mid,
      osdCapabilities: capabilities,
      selectedPolicy: policy,
      osdCyclePolicy: policy.cyclePolicies,
      isCustomAllowed: () => true,
      telescopeBand: (band: string) => (band === 'low_band' ? 1 : 2)
    })
  };
});

vi.mock('@/utils/help/useHelp', () => ({ useHelp: () => ({ setHelp: vi.fn() }) }));
vi.mock('@/components/layout/HelpShell/HelpShell', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));
vi.mock('@/components/layout/pageBannerPPT/PageBannerPPT', () => ({ default: () => null }));
vi.mock('@/components/button/Add/Add', () => ({
  default: (props: { testId: string; action: () => void; disabled: boolean }) => (
    <button data-testid={props.testId} onClick={props.action} disabled={props.disabled} />
  )
}));

// Exposes the proposal form
let formProbe: UseFormReturn<ProposalType>;
const FormProbe = () => {
  formProbe = useFormContext<ProposalType>();
  return null;
};

// The proposal form is seeded from the store, which holds the observations in its own shape
const renderWithProposal = (component: React.ReactElement, proposal: object = {}) => {
  vi.spyOn(storageObject, 'useStore').mockReturnValue({
    ...completeMockStore,
    application: {
      ...completeMockStore.application,
      content2: {
        id: 'prsl-1',
        proposalType: PROPOSAL_TYPE.STANDARD,
        targets: [],
        targetObservation: [],
        observations: [],
        ...proposal
      }
    }
  } as never);
  render(
    <StoreProvider>
      <TestProposalFormProvider>
        <FormProbe />
        {component}
      </TestProposalFormProvider>
    </StoreProvider>
  );
};

const numberField = (label: string) => screen.getByLabelText(label, { exact: false });
// Typed as a user does: a field with decimal places takes a change without typing as a step
const typeInto = async (label: string, value: string) => {
  const user = userEvent.setup();
  await user.clear(numberField(label));
  await user.type(numberField(label), value);
};
const select = (label: string, option: RegExp | string) => {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
  fireEvent.click(screen.getByRole('option', { name: option }));
};
const addButton = () => screen.getByTestId('addObservationButtonEntry');

const legacyObservation = (id: string) => ({ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id });

describe('<ObservationEntry />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockState.locationState = null;
    mockState.navigate.mockClear();
  });

  test('adds a new observation in the first band of the cycle', async () => {
    renderWithProposal(<ObservationEntry />);

    await waitFor(() => expect(addButton()).toBeEnabled());
    fireEvent.click(addButton());

    expect(formProbe.getValues('observations')).toEqual([
      expect.objectContaining({
        observingBand: 'low_band',
        subarray: 'aa2_sv',
        observingMode: 'continuum',
        centralFrequency: { value: 199.609375, unit: 'MHz' },
        bandwidth: { value: 150, unit: 'MHz' }
      })
    ]);
    expect(mockState.navigate).toHaveBeenCalledWith(NAV[PAGE_OBSERVATION]);
  });

  test('updates the observation passed in the route state, keeping the others', async () => {
    mockState.locationState = { id: 'obs-2' };
    renderWithProposal(<ObservationEntry />, {
      observations: [legacyObservation('obs-1'), legacyObservation('obs-2')]
    });
    const update = screen.getByTestId('updateObservationButtonEntry');

    fireEvent.change(numberField('sensitivityCalculatorResults.integrationTime'), {
      target: { value: '3' }
    });
    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);

    const [first, second] = formProbe.getValues('observations');
    expect(first).toMatchObject({ id: 'obs-1', integrationTime: { value: 1, unit: 'h' } });
    expect(second).toMatchObject({ id: 'obs-2', integrationTime: { value: 3, unit: 'h' } });
  });

  test("can't be added while invalid, and shows the error on the field", async () => {
    renderWithProposal(<ObservationEntry />);
    await waitFor(() => expect(addButton()).toBeEnabled());

    // Less than 8 coarse channels
    await typeInto('bandwidth.label', '5');

    expect(
      await screen.findByText('Bandwidth must be larger than the channel width (6250.00 kHz)')
    ).toBeInTheDocument();
    expect(addButton()).toBeDisabled();
  });

  test('starts again from the MID defaults when the band changes to MID', async () => {
    renderWithProposal(<ObservationEntry />);

    select('observingBand.label', /Band_5b/);

    expect(numberField('weather.label')).toBeInTheDocument();
    await waitFor(() => expect(addButton()).toBeEnabled());
    fireEvent.click(addButton());
    expect(formProbe.getValues('observations')).toEqual([
      expect.objectContaining({
        telescope: 'ska_mid',
        observingBand: 'Band_5b',
        integrationTime: { value: 10, unit: 'min' },
        elevation: 15,
        weather: 10
      })
    ]);
  });

  test('keeps the zoom factor, channels and bandwidth of a spectral line observation in step', async () => {
    renderWithProposal(<ObservationEntry />);
    select('observationType.label', 'observationType.spectral');
    const channels = () => numberField('zoomChannels.label') as HTMLInputElement;
    const bandwidth = () => numberField('bandwidth.label') as HTMLInputElement;

    // 1000 channels of 1808.45 Hz
    fireEvent.change(channels(), { target: { value: '1000' } });
    expect(bandwidth().value).toBe('1.808449');

    // Half the width keeps the channels and halves the bandwidth
    select('spectralResolution.label', /^904\.22 Hz/);
    expect(channels().value).toBe('1000');
    expect(bandwidth().value).toBe('0.904225');

    // A bandwidth that isn't a whole number of channels
    await typeInto('bandwidth.label', '0.9');
    expect(Number(channels().value)).toBeCloseTo(995.33, 2);
    // On the channels, and on the bandwidth that set them
    const notWhole = 'Number of channels must be a whole number of at least 2';
    expect(await screen.findAllByText(notWhole)).toHaveLength(2);

    // The bandwidth's up arrow steps to the next whole number of channels, which clears both
    fireEvent.change(bandwidth(), { target: { value: '0.901' } });
    expect(channels().value).toBe('996');
    await waitFor(() => expect(screen.queryByText(notWhole)).toBeNull());
  });

  test('shows the central frequency is off the grid when an odd number of channels moves it', async () => {
    renderWithProposal(<ObservationEntry />);
    select('observationType.label', 'observationType.spectral');
    const offGrid = 'Invalid central frequency - please adjust using the arrows';

    // The default central frequency is on the grid of the default 1800 channels
    await typeInto('zoomChannels.label', '1798');
    expect(screen.queryByText(offGrid)).toBeNull();

    await typeInto('zoomChannels.label', '1801');
    expect(await screen.findByText(offGrid)).toBeInTheDocument();
  });

  test('joins a new group', async () => {
    renderWithProposal(<ObservationEntry />);

    select('groupObservations.label', 'groupObservations.new');
    await waitFor(() => expect(addButton()).toBeEnabled());
    fireEvent.click(addButton());

    expect(formProbe.getValues('observations')[0].groupId).toMatch(/^group-/);
  });
});

// An image of the observation with the user's sizes
const image = (observationId: string) =>
  ({
    ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, observationId),
    id: 'dp-1',
    imageSize: { value: 12.3, unit: 'deg' },
    pixelSize: { value: 4.5, unit: 'arcsec' }
  }) as Parameters<typeof updateImageSizes>[0];

describe('the data products of an edited observation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockState.locationState = null;
  });

  // 249.609375 MHz is on the LOW coarse channel grid

  test('follow each change of the central frequency in place', async () => {
    renderWithProposal(<ObservationInPlace />, {
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [legacyObservation('obs-1')],
      dataProducts: [image('obs-1')]
    });

    await typeInto('centralFrequency.label', '249.609375');

    expect(formProbe.getValues('dataProducts')).toEqual([
      updateImageSizes(image('obs-1'), 249.609375)
    ]);
  });

  test("follow the entry page's observation when it is updated, and not before", async () => {
    mockState.locationState = { id: 'obs-1' };
    renderWithProposal(<ObservationEntry />, {
      observations: [legacyObservation('obs-1')],
      dataProducts: [image('obs-1')]
    });
    const update = screen.getByTestId('updateObservationButtonEntry');

    await typeInto('centralFrequency.label', '249.609375');
    expect(formProbe.getValues('dataProducts')).toEqual([image('obs-1')]);

    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);
    expect(formProbe.getValues('dataProducts')).toEqual([
      updateImageSizes(image('obs-1'), 249.609375)
    ]);
  });

  test("stay as they are when the entry page's observation is updated without a change", async () => {
    mockState.locationState = { id: 'obs-1' };
    renderWithProposal(<ObservationEntry />, {
      observations: [legacyObservation('obs-1')],
      dataProducts: [image('obs-1')]
    });
    const update = screen.getByTestId('updateObservationButtonEntry');

    await waitFor(() => expect(update).toBeEnabled());
    fireEvent.click(update);

    expect(formProbe.getValues('dataProducts')).toEqual([image('obs-1')]);
  });
});

describe('<ObservationInPlace />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("edits the SV proposal's observation in the proposal form", () => {
    renderWithProposal(<ObservationInPlace />, {
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [legacyObservation('obs-1')]
    });

    fireEvent.change(numberField('sensitivityCalculatorResults.integrationTime'), {
      target: { value: '3' }
    });

    expect(formProbe.getValues('observations')).toEqual([
      expect.objectContaining({ id: 'obs-1', integrationTime: { value: 3, unit: 'h' } })
    ]);
  });

  test('has the observing mode of the Details page, and no identifier, group or elevation', () => {
    renderWithProposal(<ObservationInPlace />, {
      proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
      observations: [legacyObservation('obs-1')]
    });

    expect(screen.getByRole('combobox', { name: 'observationType.label' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.queryByTestId('observationId')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'groupObservations.label' })).toBeNull();
    expect(screen.queryByLabelText('elevation.label', { exact: false })).toBeNull();
  });
});
