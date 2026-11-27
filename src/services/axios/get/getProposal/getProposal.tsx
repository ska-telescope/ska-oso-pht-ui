import Observation from '@utils/types/observation.tsx';
import Supplied from '@utils/types/supplied.tsx';
import {
  DETAILS,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_CONTINUUM_SPECTRAL_LONG,
  TYPE_ZOOM,
  TELESCOPE_MID_BACKEND_MAPPING,
  TELESCOPE_LOW_BACKEND_MAPPING,
  SA_AA2,
  FREQUENCY_UNITS,
  TYPE_PST,
  PST_MODES,
  FREQUENCY_STR_MHZ,
  BAND_LOW_STR,
  FREQUENCY_STR_GHZ,
  TYPE_ZOOM_LONG
} from '@utils/constants.ts';
import Investigator, { InvestigatorBackend } from '@utils/types/investigator.tsx';
import { OSD_CONSTANTS } from '@utils/OSDConstants.ts';
import type {
  LowArray,
  MidArray,
  ObservationSets,
  PstSetup,
  SpectralLineSetup,
  Supplied as SuppliedTransport
} from '@/generated/models';

export const getInvestigators = (inValue: InvestigatorBackend[] | null | undefined) => {
  const investigators = [] as Investigator[];
  if (!inValue || inValue.length === 0) {
    return investigators;
  }
  for (let i = 0; i < inValue?.length; i++) {
    investigators.push({
      id: inValue[i].user_id as string,
      status: inValue[i].status,
      firstName: inValue[i].given_name ?? undefined,
      lastName: inValue[i].family_name ?? undefined,
      email: inValue[i].email ?? undefined,
      phdThesis: inValue[i].for_phd ?? false,
      pi: inValue[i].principal_investigator ?? false
    });
  }
  return investigators;
};

export const getScienceCategory = (scienceCat: string) => {
  const cat = DETAILS.ScienceCategory?.find(
    (c) => c.label.toLowerCase() === scienceCat?.toLowerCase()
  )?.value;
  return cat === null || cat === undefined ? null : cat;
};

/*********************************************************** observation parameters mapping *********************************************************/
const getSupplied = (inSupplied: SuppliedTransport | null): Supplied => {
  const suppliedType = OSD_CONSTANTS.Supplied?.find(
    (s) => s.mappingLabel === inSupplied?.supplied_type
  );
  const suppliedUnits =
    suppliedType?.units?.find((u) => u.label === inSupplied?.quantity.unit)?.value ??
    inSupplied?.supplied_type;
  const supplied = {
    type: suppliedType?.value,
    value: inSupplied?.quantity.value,
    units: suppliedUnits ? suppliedUnits : 1
  };
  return supplied as Supplied;
};

export const getFrequencyAndBandwidthUnits = (
  inUnits: string | null,
  observingBand: string
): number => {
  const units = FREQUENCY_UNITS.find(
    (item) => item.mapping.toLowerCase() === inUnits?.toLowerCase()
  )?.value;
  return units
    ? units
    : (FREQUENCY_UNITS.find(
        (item) =>
          item.label.toLowerCase() ===
          (observingBand === BAND_LOW_STR ? FREQUENCY_STR_GHZ : FREQUENCY_STR_MHZ).toLowerCase()
      )?.value as number);
};

export const getBandwidth = (incBandwidth: number, telescope: number): number => {
  const options = OSD_CONSTANTS.array?.find((item) => item?.value === telescope)?.bandWidth ?? [];
  if (options.length === 0) return 1;
  // Match by nearest numeric value rather than an exact substring of the label, since the
  // backend can round/reformat the stored number (e.g. 390.625 -> 390.63) - an exact string
  // match would silently fall through to the default and lose the saved selection.
  const closest = options.reduce((best, candidate) =>
    Math.abs(Number(candidate?.label?.split(' ')[0]) - incBandwidth) <
    Math.abs(Number(best?.label?.split(' ')[0]) - incBandwidth)
      ? candidate
      : best
  );
  return closest.value;
};

// This is here as there is inconsistent representation of spectral and spectral line.
const typeCheck = (inType: string | undefined): any => {
  if (inType === TYPE_ZOOM_LONG) return TYPE_ZOOM;
  if (inType === TYPE_CONTINUUM_SPECTRAL_LONG) return TYPE_CONTINUUM_SPECTRAL;
  return inType;
};

export const getObservations = (inValue: ObservationSets[] | null | undefined): Observation[] => {
  const results: Observation[] = [];
  if (!inValue || inValue.length === 0) {
    return results;
  }
  for (let i = 0; i < inValue?.length; i++) {
    const arr = inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING ? 1 : 2;
    //TODO: Rework logic to reference array label rather than number
    // Older observations may have been saved as 'aa2' before the LOW array assembly was
    // renamed to 'aa2_sv' - normalise so those still resolve to the current SA_AA2 entry.
    const backendSubarray = inValue[i]?.array_details?.subarray?.toLocaleLowerCase();
    const normalizedSubarray = backendSubarray === 'aa2' ? SA_AA2 : backendSubarray;
    const sub = OSD_CONSTANTS.array[arr - 1].subarray?.find(
      (p) => p.value.toLowerCase() === normalizedSubarray
    )?.value;

    const type = typeCheck(inValue[i]?.observation_type_details?.observation_type);

    const observingBand = inValue[i]?.observing_band;

    // MID array details
    let weather, num15mAntennas, num13mAntennas, numSubBands;
    if (inValue[i]?.array_details?.array === TELESCOPE_MID_BACKEND_MAPPING) {
      const midDetails = inValue[i].array_details as MidArray;
      weather = midDetails.weather;
      num15mAntennas = midDetails.number_15_antennas;
      num13mAntennas = midDetails.number_13_antennas;
      numSubBands = midDetails.number_sub_bands;
    }

    // LOW array details
    let numStations;
    if (inValue[i]?.array_details?.array === TELESCOPE_LOW_BACKEND_MAPPING) {
      const lowDetails = inValue[i].array_details as LowArray;
      numStations = lowDetails.number_of_stations;
    }

    const obs: Observation = {
      id: inValue[i].observation_set_id,
      telescope: arr,
      subarray: sub ? sub : '',
      type: String(type),
      observingBand: observingBand,
      weather: weather,
      centralFrequency: inValue[i]?.observation_type_details?.central_frequency?.value as number,
      centralFrequencyUnits: getFrequencyAndBandwidthUnits(
        inValue[i]?.observation_type_details?.central_frequency?.unit ?? null,
        observingBand
      ),
      elevation: inValue[i]?.elevation as number,
      num13mAntennas: num13mAntennas,
      num15mAntennas: num15mAntennas,
      numSubBands: numSubBands ? numSubBands : 1,
      bandwidth:
        type === TYPE_ZOOM
          ? getBandwidth(inValue[i].observation_type_details?.bandwidth?.value ?? 0, arr)
          : null,
      supplied: getSupplied(inValue[i].observation_type_details?.supplied ?? null),
      spectralResolution: String(
        (inValue[i].observation_type_details as SpectralLineSetup)?.spectral_resolution
      ),
      continuumBandwidth:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? (inValue[i].observation_type_details?.bandwidth?.value ?? null)
          : null,
      continuumBandwidthUnits:
        type === TYPE_CONTINUUM || type === TYPE_PST || type === TYPE_CONTINUUM_SPECTRAL
          ? getFrequencyAndBandwidthUnits(
              inValue[i]?.observation_type_details?.bandwidth?.unit ?? null,
              observingBand
            )
          : null,
      numStations: numStations,
      ...(type === TYPE_ZOOM && {
        zoomChannels:
          (inValue[i].observation_type_details as SpectralLineSetup)?.number_of_channels ??
          undefined
      }),
      ...(type === TYPE_PST && {
        pstMode: PST_MODES?.find(
          (mode) => mode?.mapping === (inValue[i].observation_type_details as PstSetup)?.pst_mode
        )?.value
      })
    };
    results.push(obs);
  }
  return results;
};
