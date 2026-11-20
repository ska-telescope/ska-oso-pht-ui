import { dataProductsAndLinksToSave, type DataProductInput } from './dataProducts';
import { getObservationSchema, observationsToPdm, type ObservationInput } from './observations';

/**
 * An observation is saved when it meets its own rules. The rules that need the OSD are left out,
 * as the backend doesn't check them. Data products, links or calibrations belonging to an invalid
 * observation are left out.
 */
export const observationInfoToSave = <
  Link extends { observationId: string; dataProductsSDPId: string },
  Strategy extends { observationIdRef: string }
>({
  observations,
  dataProducts,
  links,
  calibrationStrategy
}: {
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
  const saved = dataProductsAndLinksToSave(
    dataProducts.filter((dataProduct) => savedIds.has(dataProduct.observationId)),
    links.filter((link) => savedIds.has(link.observationId))
  );
  return {
    observationSets: observationsToPdm(valid),
    dataProducts: saved.dataProducts,
    links: saved.links,
    calibrationStrategy: calibrationStrategy.filter((strategy) =>
      savedIds.has(strategy.observationIdRef)
    )
  };
};
