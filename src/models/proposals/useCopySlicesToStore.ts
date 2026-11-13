import React from 'react';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { storageObject } from '@utils/storage/store';
import Proposal from '@utils/types/proposal';
import { DataProductSDPNew } from '@utils/types/dataProduct';
import {
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  IMAGE_WEIGHTING,
  PULSAR_TIMING_VALUE,
  ROBUST_DEFAULT
} from '@utils/constants';
import { ImageWeighting } from '@/generated/models';
import { ProposalType, STORE_COPIED_SLICES } from './proposal';
import {
  ANGLE_UNIT,
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD,
  steppedToPdm
} from './dataProducts';

const pickSlices = (values: Partial<ProposalType>) =>
  Object.fromEntries(STORE_COPIED_SLICES.map((key) => [key, values[key]])) as ProposalType;

// The legacy shape stores units and weighting as indexes into these lists
const LEGACY_ANGLE_UNITS: string[] = [ANGLE_UNIT.DEG, ANGLE_UNIT.ARCMIN, ANGLE_UNIT.ARCSEC];

// -1 for a unit not yet chosen, as the legacy load gave for a unit it didn't know
const legacyAngleUnit = (unit: string | null) => (unit ? LEGACY_ANGLE_UNITS.indexOf(unit) : -1);

export const dataProductToLegacy = (dp: DataProductInput): DataProductSDPNew => {
  const ids = { id: dp.id, observationId: dp.observationId };
  switch (dp.kind) {
    case DATA_PRODUCT_KIND.CONTINUUM_IMAGE:
    case DATA_PRODUCT_KIND.SPECTRAL_IMAGE:
    case DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE: {
      const image = {
        dataProductType: DP_TYPE_IMAGES,
        imageSizeValue: dp.imageSize.value,
        imageSizeUnits: legacyAngleUnit(dp.imageSize.unit),
        pixelSizeValue: dp.pixelSize.value,
        pixelSizeUnits: legacyAngleUnit(dp.pixelSize.unit),
        weighting: IMAGE_WEIGHTING.find((item) => item.label === dp.weighting.type)!.value,
        // The legacy shape always has a robust; it is only used for Briggs
        robust: dp.weighting.type === ImageWeighting.Briggs ? dp.weighting.robust : ROBUST_DEFAULT,
        taperValue: dp.taper,
        channelsOut: dp.channelsOut,
        polarisations: dp.polarisations
      };
      if (dp.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE) {
        return { ...ids, data: { ...image, continuumSubtraction: dp.continuumSubtraction } };
      }
      return { ...ids, data: image };
    }
    case DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES:
      return {
        ...ids,
        data: {
          dataProductType: DP_TYPE_VISIBLE,
          timeAveraging: steppedToPdm(dp.timeAveragingS, STEPPED_FIELD.TIME_AVERAGING_S),
          frequencyAveraging: steppedToPdm(
            dp.frequencyAveragingKhz,
            STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ
          )
        }
      };
    case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
      return {
        ...ids,
        data: {
          dataProductType: FLOW_THROUGH_VALUE,
          polarisations: dp.polarisations,
          bitDepth: dp.bitDepth
        }
      };
    case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
      return {
        ...ids,
        data: {
          dataProductType: DETECTED_FILTER_BANK_VALUE,
          polarisations: dp.polarisations,
          bitDepth: dp.bitDepth,
          outputFrequencyResolution: steppedToPdm(
            dp.outputFrequencyResolutionKhz,
            STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
          ),
          outputSamplingInterval: steppedToPdm(
            dp.outputSamplingIntervalMs,
            STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS
          ),
          dispersionMeasure: dp.dispersionMeasure,
          rotationMeasure: dp.rotationMeasure
        }
      };
    case DATA_PRODUCT_KIND.PST_TIMING:
      return { ...ids, data: { dataProductType: PULSAR_TIMING_VALUE } };
  }
};

// The slices plus the legacy shape of the data products, for the readers not yet moved to the form
const storeCopy = (slices: ProposalType) => ({
  ...slices,
  dataProductSDP: slices.dataProducts.map(dataProductToLegacy)
});

/*********************************************************************************************************/

/**
 * Keeps the legacy store's copy of every form-owned slice up to date for code that still reads
 * them from there (page status, the observation summary, the sensitivity modal, clone, and the
 * pages not yet migrated). The data products are also copied in their legacy shape. It is the one place the form's values reach the store: pages write
 * only to the form. The copy only goes from the form to the store, and also corrects the store
 * when a legacy write puts an older copy back.
 *
 * Call it straight after useProposalForm, so a re-seed on proposal switch has already happened.
 * Only one form may copy into the store: two would keep overwriting each other. A second one
 * reports an error and copies nothing.
 */
// The hook instance currently copying into the store
let copyOwner: symbol | null = null;

export function useCopySlicesToStore(
  form: Pick<UseFormReturn<ProposalType>, 'control' | 'getValues'>
) {
  const { application, updateAppContent2 } = storageObject.useStore();
  const watched = useWatch({ control: form.control, name: [...STORE_COPIED_SLICES] });
  const proposal = application.content2 as Proposal;
  const ownerId = React.useRef(Symbol('useCopySlicesToStore'));

  React.useEffect(() => {
    if (copyOwner) {
      console.error('useCopySlicesToStore: another form already copies into the store');
      return;
    }
    copyOwner = ownerId.current;
    return () => {
      if (copyOwner === ownerId.current) {
        copyOwner = null;
      }
    };
  }, []);

  React.useEffect(() => {
    if (copyOwner !== ownerId.current) {
      return;
    }
    // Nothing to copy into until a proposal is open (the store is cleared between proposals). A
    // new proposal is open before it has an ID, while its title and type are being entered.
    if (!proposal || !('id' in proposal)) {
      return;
    }
    // Read the form now rather than the watched values, which can still be the previous
    // proposal's when the form was re-seeded in this commit
    const copy = storeCopy(pickSlices(form.getValues()));
    const stored = { ...pickSlices(proposal), dataProductSDP: proposal.dataProductSDP };
    if (JSON.stringify(stored) === JSON.stringify(copy)) {
      return;
    }
    // The store freezes what it is given, and the form must stay mutable
    updateAppContent2({ ...proposal, ...structuredClone(copy) });
  }, [...watched, proposal]);
}
