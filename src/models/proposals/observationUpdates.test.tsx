import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PstMode } from '@/generated/models';
import { BAND_1_STR, BAND_LOW_STR, SA_AA2 } from '@/utils/constants';
import { MockObservatoryDataFrontend } from '@services/axios/get/getObservatoryData/mockObservatoryDataFrontend';
import { Calibrator } from '@/utils/types/calibrationStrategy';
import type { ProposalFormAccess, ProposalType } from './proposal';
import { getProposalFormDefaults } from './useProposalForm';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  newDataProduct,
  updateImageSizes
} from './dataProducts';
import { newObservation, ObservationInput, ObservingMode, OBSERVING_MODE } from './observations';
import {
  refreshCalibrators,
  replacePstDataProduct,
  resizeImageDataProducts,
  setSpectralChannelsOut
} from './observationUpdates';

// The calibrator lookup goes to the backend. The tests hold it open where it matters.
const mockLookupCalibrators = vi.hoisted(() =>
  vi.fn(async (): Promise<Calibrator[] | null> => null)
);
vi.mock('./calibrationOperations', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./calibrationOperations')>()),
  lookupCalibrators: mockLookupCalibrators
}));

const osd = MockObservatoryDataFrontend.capabilities;

// A form over plain values, so each test can check every slice in one place
const formOver = (initial: Partial<ProposalType>) => {
  const values = { ...getProposalFormDefaults(), ...initial };
  const form = {
    getValues: (name?: keyof ProposalType) => (name ? values[name] : values),
    setValue: (name: keyof ProposalType, value: never) => {
      values[name] = value;
    }
  } as unknown as ProposalFormAccess;
  return { form, values };
};

const observationIn = (
  band: typeof BAND_LOW_STR | typeof BAND_1_STR,
  mode: ObservingMode = OBSERVING_MODE.CONTINUUM
) => ({ ...newObservation(band, SA_AA2, mode, osd), id: 'obs-1' }) as ObservationInput;

// An image with the user's sizes
const image = (observationId: string, id: string) =>
  ({
    ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, observationId),
    id,
    imageSize: { value: 12.3, unit: 'deg' },
    pixelSize: { value: 4.5, unit: 'arcsec' }
  }) as Parameters<typeof updateImageSizes>[0];

beforeEach(() => {
  vi.clearAllMocks();
  mockLookupCalibrators.mockImplementation(async () => null);
});

describe('resizeImageDataProducts', () => {
  test.each([BAND_LOW_STR, BAND_1_STR] as const)(
    "sizes the observation's images for its central frequency in %s",
    (band) => {
      const observation = {
        ...observationIn(band),
        centralFrequency: { value: 300, unit: 'MHz' }
      } as ObservationInput;
      const other = image('obs-2', 'dp-2');
      const { form, values } = formOver({
        observations: [observation],
        dataProducts: [image('obs-1', 'dp-1'), other]
      });

      resizeImageDataProducts(form, observation);

      expect(values.dataProducts).toEqual([updateImageSizes(image('obs-1', 'dp-1'), 300), other]);
      expect(values.dataProducts[0]).not.toMatchObject({ imageSize: { value: 12.3 } });
    }
  );
});

describe('setSpectralChannelsOut', () => {
  test("gives the spectral image the observation's channels", () => {
    const observation = {
      ...observationIn(BAND_LOW_STR, OBSERVING_MODE.SPECTRAL),
      zoomChannels: 500
    } as ObservationInput;
    const spectralImage = {
      ...newDataProduct(DATA_PRODUCT_KIND.SPECTRAL_IMAGE, 'obs-1'),
      channelsOut: 1800
    } as DataProductInput;
    const { form, values } = formOver({ dataProducts: [spectralImage] });

    setSpectralChannelsOut(form, observation);

    expect(values.dataProducts).toEqual([{ ...spectralImage, channelsOut: 500 }]);
  });
});

describe('replacePstDataProduct', () => {
  test("gives the PST data product the new mode's kind and defaults, keeping its identifier", () => {
    const observation = {
      ...observationIn(BAND_LOW_STR, OBSERVING_MODE.PST),
      pstMode: PstMode.FlowThrough
    } as ObservationInput;
    const { form, values } = formOver({
      dataProducts: [{ ...newDataProduct(DATA_PRODUCT_KIND.PST_TIMING, 'obs-1'), id: 'dp-1' }]
    });

    replacePstDataProduct(form, observation);

    expect(values.dataProducts).toEqual([
      expect.objectContaining({
        id: 'dp-1',
        observationId: 'obs-1',
        kind: DATA_PRODUCT_KIND.PST_FLOW_THROUGH
      })
    ]);
  });
});

describe('refreshCalibrators', () => {
  const calibrators = [{ id: 'cal-1' }] as unknown as Calibrator[];
  const target = { id: 'target-1', name: 'M2', kind: 0 } as never;
  const linked = () => {
    const observation = observationIn(BAND_LOW_STR);
    return formOver({
      targets: [target],
      observations: [observation],
      targetObservation: [
        { targetId: 'target-1', observationId: 'obs-1', dataProductsSDPId: 'dp-1' }
      ],
      calibrationStrategy: [
        {
          observatoryDefined: true,
          id: 'cal-strategy',
          observationIdRef: 'obs-1',
          calibrators: null,
          notes: 'Notes'
        }
      ]
    });
  };
  let finishLookup: () => void;

  beforeEach(() => {
    mockLookupCalibrators.mockImplementationOnce(
      () => new Promise((resolve) => (finishLookup = () => resolve(calibrators)))
    );
  });

  test("sets the calibrators on the observation's calibration, keeping its notes", async () => {
    const { form, values } = linked();

    const refreshing = refreshCalibrators(form, 'obs-1');
    finishLookup();
    await refreshing;

    expect(values.calibrationStrategy).toEqual([
      expect.objectContaining({ id: 'cal-strategy', calibrators, notes: 'Notes' })
    ]);
  });

  test('ignores a lookup that another change of the integration time has overtaken', async () => {
    const { form, values } = linked();

    const refreshing = refreshCalibrators(form, 'obs-1');
    form.setValue('observations', [
      { ...values.observations[0], integrationTime: { value: 3, unit: 'h' } }
    ]);
    finishLookup();
    await refreshing;

    expect(values.calibrationStrategy[0].calibrators).toBeNull();
  });

  test('ignores a lookup for a target that was unlinked meanwhile', async () => {
    const { form, values } = linked();

    const refreshing = refreshCalibrators(form, 'obs-1');
    form.setValue('targetObservation', []);
    finishLookup();
    await refreshing;

    expect(values.calibrationStrategy[0].calibrators).toBeNull();
  });
});
