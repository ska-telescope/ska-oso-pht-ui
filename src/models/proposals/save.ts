import { dataProductsAndLinksToSave, type DataProductInput } from './dataProducts';
import { getObservationSchema, observationsToPdm, type ObservationInput } from './observations';

/**
 * An observation is saved when it meets its own rules. The rules that need the OSD are left out,
 * as the backend doesn't check them. Data products, links or calibrations belonging to an invalid
 * observation are left out, except for SV: the user can't add an SV observation, so the load gives
 * it back with the defaults and the ID they still refer to (see withSvDefaults), and the user's
 * data products, link and calibration notes are kept. The backend doesn't check the references.
 */
export const observationInfoToSave = <
  Link extends { observationId: string; dataProductsSDPId: string },
  Strategy extends { observationIdRef: string }
>({
  isSV,
  observations,
  dataProducts,
  links,
  calibrationStrategy
}: {
  isSV: boolean;
  observations: ObservationInput[];
  dataProducts: DataProductInput[];
  links: Link[];
  calibrationStrategy: Strategy[];
}) => {
  const valid = observations.flatMap((observation) => {
    const parsed = getObservationSchema().safeParse(observation);
    return parsed.success ? [parsed.data] : [];
  });
  const savedIds = new Set(valid.map((observation) => observation.id));
  const isKept = (observationId: string) => isSV || savedIds.has(observationId);
  const saved = dataProductsAndLinksToSave(
    dataProducts.filter((dataProduct) => isKept(dataProduct.observationId)),
    links.filter((link) => isKept(link.observationId))
  );
  return {
    observationSets: observationsToPdm(valid),
    dataProducts: saved.dataProducts,
    links: saved.links,
    calibrationStrategy: calibrationStrategy.filter((strategy) => isKept(strategy.observationIdRef))
  };
};
