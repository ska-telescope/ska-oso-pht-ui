import { describe, expect, test } from 'vitest';
import { observationInfoToSave } from './save';
import {
  newSvObservation,
  observationsToPdm,
  OBSERVING_MODE,
  type ObservationInput,
  type ObservationValues
} from './observations';
import {
  DATA_PRODUCT_KIND,
  dataProductsToPdm,
  newDataProduct,
  type DataProductInput,
  type DataProductValues
} from './dataProducts';

const observation = (id: string) => ({ ...newSvObservation(OBSERVING_MODE.CONTINUUM, 15), id });
const dataProduct = (id: string, observationId: string) => ({
  ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, observationId),
  id
});
const link = (observationId: string, dataProductsSDPId: string) => ({
  targetId: 't1',
  observationId,
  dataProductsSDPId
});
const strategy = (observationIdRef: string) => ({
  observatoryDefined: true,
  id: `cal-${observationIdRef}`,
  observationIdRef,
  calibrators: null,
  notes: null
});

// Being edited: the integration time has no value yet
const incomplete = (id: string): ObservationInput => ({
  ...observation(id),
  integrationTime: { value: null, unit: 'h' }
});

describe('observationInfoToSave', () => {
  test('saves complete observations with their data products, links and calibration', () => {
    const saved = observationInfoToSave({
      observations: [observation('o1')],
      dataProducts: [dataProduct('dp1', 'o1')],
      links: [link('o1', 'dp1')],
      calibrationStrategy: [strategy('o1')]
    });

    expect(saved).toEqual({
      observationSets: observationsToPdm([observation('o1') as ObservationValues]),
      dataProducts: dataProductsToPdm([dataProduct('dp1', 'o1') as DataProductValues]),
      links: [link('o1', 'dp1')],
      calibrationStrategy: [strategy('o1')]
    });
  });

  test('leaves out an incomplete observation with its data products, links and calibration', () => {
    const saved = observationInfoToSave({
      observations: [observation('o1'), incomplete('o2')],
      dataProducts: [dataProduct('dp1', 'o1'), dataProduct('dp2', 'o2')],
      links: [link('o1', 'dp1'), link('o2', 'dp2')],
      calibrationStrategy: [strategy('o1'), strategy('o2')]
    });

    expect(saved.observationSets.map((set) => set.observation_set_id)).toEqual(['o1']);
    expect(saved.dataProducts.map((dp) => dp.data_product_id)).toEqual(['dp1']);
    expect(saved.links).toEqual([link('o1', 'dp1')]);
    expect(saved.calibrationStrategy).toEqual([strategy('o1')]);
  });

  // The backend doesn't check the rules that need the OSD, so they don't stop a save
  test('saves an observation outside its band', () => {
    const outOfBand = { ...observation('o1'), centralFrequency: { value: 400, unit: 'MHz' } };

    const saved = observationInfoToSave({
      observations: [outOfBand as ObservationInput],
      dataProducts: [],
      links: [],
      calibrationStrategy: []
    });

    expect(saved.observationSets.map((set) => set.observation_set_id)).toEqual(['o1']);
  });

  test('leaves out an invalid data product of a saved observation, and its links', () => {
    // Being edited: the image size has no unit yet
    const invalid = {
      ...dataProduct('dp2', 'o1'),
      imageSize: { value: 1, unit: null }
    } as DataProductInput;

    const saved = observationInfoToSave({
      observations: [observation('o1')],
      dataProducts: [dataProduct('dp1', 'o1'), invalid],
      links: [link('o1', 'dp1'), link('o1', 'dp2')],
      calibrationStrategy: [strategy('o1')]
    });

    expect(saved.dataProducts.map((dp) => dp.data_product_id)).toEqual(['dp1']);
    expect(saved.links).toEqual([link('o1', 'dp1')]);
    expect(saved.calibrationStrategy).toEqual([strategy('o1')]);
  });
});
