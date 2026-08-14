import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BorderedSection,
  DropDown,
  Spacer,
  SPACER_VERTICAL
} from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import RobustField from '@components/fields/robust/Robust.tsx';
import PixelSizeField from '@components/fields/pixelSize/pixelSize.tsx';
import { useTheme } from '@mui/material/styles';
import TickIcon from '@components/icon/tickIcon/tickIcon.tsx';
import TaperDropdown from '@/components/fields/taperDropdown/taperDropdown';
import { ValueUnitPair } from '@utils/types/typesSensCalc.tsx';
import PolarisationsField from '@/components/fields/polarisations/polarisations';
import { HiddenSDPData } from '@/utils/autoLinking/AutoLinking';
import {
  BAND_LOW_STR,
  BIT_DEPTH_DEFAULT,
  CHANNELS_OUT_DEFAULT,
  CHANNELS_OUT_MAX,
  CHANNELS_OUT_MAX_COMBINED,
  CHANNELS_OUT_MIN,
  DETECTED_FILTER_BANK_VALUE,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  FOOTER_HEIGHT_PHT,
  FREQUENCY_AVERAGING_DEFAULT,
  IMAGE_SIZE_DEFAULT,
  IMAGE_SIZE_UNIT_DEFAULT,
  IW_BRIGGS,
  IW_NATURAL,
  IW_UNIFORM,
  NAV,
  NOTIFICATION_DELAY_IN_SECONDS,
  PAGE_DATA_PRODUCTS,
  PIXEL_SIZE_DEFAULT,
  PIXEL_SIZE_UNIT_DEFAULT,
  POLARISATIONS_DEFAULT,
  PULSAR_TIMING_VALUE,
  REFERENCE_COORDINATE_TYPE_SSO,
  ROBUST_DEFAULT,
  SA_CUSTOM,
  SET_CONTINUUM_SUBSTRACTION_DEFAULT,
  STATUS_INITIAL,
  TAPER_DEFAULT,
  TIME_AVERAGING_DEFAULT,
  TYPE_CONTINUUM,
  TYPE_CONTINUUM_SPECTRAL,
  TYPE_PST,
  TYPE_ZOOM,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import Proposal from '@/utils/types/proposal';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import AddButton from '@/components/button/Add/Add';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { presentUnits } from '@/utils/present/present';
import Observation from '@/utils/types/observation';
import GridObservation from '@/components/grid/observation/GridObservation';
import ImageSizeField from '@/components/fields/imageSize/imageSize';
import ChannelsOutField from '@/components/fields/channelsOut/channelsOut';
import DataProductTypeField from '@/components/fields/dataProductType/dataProductType';
import TaperField from '@/components/fields/taper/taper';
import TimeAveragingField from '@/components/fields/timeAveraging/timeAveraging';
import FrequencyAveragingField from '@/components/fields/frequencyAveraging/frequencyAveraging';
import BitDepthField from '@/components/fields/bitDepth/bitDepth';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { generateDataProductId } from '@/utils/helpers';
import { useHelp } from '@/utils/help/useHelp';
import ContinuumSubtractionField from '@/components/fields/continuumSubtraction/continuumSubtraction';
import SensCalcContent from '@/components/alerts/sensCalcModal/content/SensCalcContent';
import { updateDataProducts } from '@/utils/update/dataProducts/updateDataProducts';
import { scheduleSensCalcUpdate } from '@/utils/update/sensCalc/updateSensCalc';
import { DataProductSDPNew, SDPVisibilitiesContinuumData } from '@/utils/types/dataProduct';
import OutputFrequencyResolutionField from '@/components/fields/outputFrequencyResolution/outputFrequencyResolution';
import DispersionMeasureField from '@/components/fields/dispersionMeasure/dispersionMeasure';
import RotationMeasureField from '@/components/fields/rotationMeasure/rotationMeasure';
import OutputSamplingIntervalField from '@/components/fields/outputSamplingInterval/outputSamplingInterval';
import TargetObservation from '@/utils/types/targetObservation';
import { updateImagesDataProductSizes } from '@utils/update/dataProductsOnObservationChange/updateDataProductsOnObservationChange.tsx';

const GAP = 5;
const BACK_PAGE = PAGE_DATA_PRODUCTS;
const COL = 6;
const COL_MID = 8;

interface DataProductProps {
  data?: DataProductSDPNew;
}

export default function DataProduct({ data }: DataProductProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const theme = useTheme();
  const { osdCyclePolicy } = useOSDAccessors();
  const { setHelp } = useHelp();

  const isEdit = () => locationProperties.state != null || data !== undefined;

  const { application, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [baseObservations, setBaseObservations] = React.useState<Observation[]>([]);
  const [id, setId] = React.useState('');
  const [observationId, setObservationId] = React.useState('');
  const [dataProductType, setDataProductType] = React.useState(DP_TYPE_IMAGES);
  const [bitDepth, setBitDepth] = React.useState(BIT_DEPTH_DEFAULT);
  const [imageSizeValue, setImageSizeValue] = React.useState(IMAGE_SIZE_DEFAULT);
  const [imageSizeUnits, setImageSizeUnits] = React.useState(IMAGE_SIZE_UNIT_DEFAULT);
  const [pixelSizeValue, setPixelSizeValue] = React.useState(PIXEL_SIZE_DEFAULT);
  const [pixelSizeUnits, setPixelSizeUnits] = React.useState(PIXEL_SIZE_UNIT_DEFAULT);
  const [taperLowValue, setTaperLowValue] = React.useState(TAPER_DEFAULT);
  const [taperMidValue, setTaperMidValue] = React.useState(TAPER_DEFAULT);
  const [timeAveraging, setTimeAveraging] = React.useState(TIME_AVERAGING_DEFAULT);
  const [frequencyAveraging, setFrequencyAveraging] = React.useState(FREQUENCY_AVERAGING_DEFAULT);

  const [weighting, setWeighting] = React.useState(IW_UNIFORM);
  const [robust, setRobust] = React.useState(ROBUST_DEFAULT);

  // channelsOutMax needs to be usable both as the initial value below and later as the field's
  // live max/validity bound, so getObservation/isCombined/channelsOutMax are defined here (ahead
  // of most other helpers in this component) rather than down with the rest of the isXxx() mode
  // checks.
  const getObservation = (obsId = observationId) => {
    const proposal = getProposal();
    const proposalObservations = proposal?.observations ?? [];
    const selectedObservation =
      baseObservations?.find((obs) => obs.id === obsId) ??
      proposalObservations.find((obs) => obs.id === obsId);

    if (selectedObservation) {
      return selectedObservation;
    }

    const pstObservation = proposalObservations.find((obs) => obs.type === TYPE_PST);
    if (pstObservation) {
      return pstObservation;
    }

    if (proposal?.scienceCategory) {
      return { type: proposal.scienceCategory } as Observation;
    }

    return proposalObservations[0];
  };
  const isCombined = () =>
    getObservation()?.type === TYPE_CONTINUUM_SPECTRAL ||
    getProposal()?.scienceCategory === TYPE_CONTINUUM_SPECTRAL;
  const channelsOutMax = () => (isCombined() ? CHANNELS_OUT_MAX_COMBINED : CHANNELS_OUT_MAX);

  const [channelsOut, setChannelsOut] = React.useState(channelsOutMax);
  const [continuumSubtraction, setContinuumSubtraction] = React.useState(
    SET_CONTINUUM_SUBSTRACTION_DEFAULT
  );
  const [polarisations, setPolarisations] = React.useState<string[]>([]);
  const [outputFrequencyResolution, setOutputFrequencyResolution] = React.useState(1);
  const [outputSamplingInterval, setOutputSamplingInterval] = React.useState(1);
  const [dispersionMeasure, setDispersionMeasure] = React.useState(1);
  const [rotationMeasure, setRotationMeasure] = React.useState(1);

  const [polarisationsError, setPolarisationsError] = React.useState('');
  const loadedDataProduct = React.useRef<DataProductSDPNew | null>(null);

  const maxObservationsReached = () =>
    baseObservations.length >= (osdCyclePolicy?.maxObservations ?? 0);

  const isDataTypeOne = () => dataProductType === DP_TYPE_IMAGES;

  const hasRealObservationSelection = () => {
    if (!observationId) {
      return false;
    }

    const proposalObservations = getProposal()?.observations ?? [];
    return proposalObservations.some((obs) => obs.id === observationId);
  };

  const getDataProductTypeValue = (dp?: DataProductSDPNew) =>
    Number(dp?.data?.dataProductType ?? DP_TYPE_IMAGES);

  const getObservationDataProducts = (obsId: string) =>
    (getProposal()?.dataProductSDP ?? []).filter((dp) => dp.observationId === obsId);

  const getObservationTargetObservations = (obsId: string) =>
    (getProposal()?.targetObservation ?? []).filter((rec) => rec.observationId === obsId);

  const hasSensCalcResults = (proposal: Proposal, obsId: string) => {
    const sensCalc = proposal.targetObservation?.find(
      (rec) => rec.observationId === obsId
    )?.sensCalc;
    return Boolean(
      sensCalc?.section1?.length || sensCalc?.section2?.length || sensCalc?.section3?.length
    );
  };

  const getLinkedDataProductId = (obsId: string, fallbackId = '') =>
    getObservationTargetObservations(obsId)[0]?.dataProductsSDPId ?? fallbackId;

  const getLinkedDataProduct = (obsId: string, fallbackId = '') => {
    const observationDataProducts = getObservationDataProducts(obsId);
    const linkedDataProductId = getLinkedDataProductId(obsId, fallbackId);
    return (
      observationDataProducts.find((dp) => dp.id === linkedDataProductId) ??
      observationDataProducts.find((dp) => dp.id === fallbackId) ??
      observationDataProducts[0]
    );
  };

  const getSiblingContinuumDataProduct = (
    obsId: string,
    currentDataProductId: string,
    nextType: number
  ) =>
    getObservationDataProducts(obsId).find(
      (dp) => dp.id !== currentDataProductId && getDataProductTypeValue(dp) === nextType
    );

  const getResolvedPstMode = () => {
    const observation = getObservation();
    const pstMode = observation?.pstMode;

    if (typeof pstMode === 'undefined' || pstMode === null || Number.isNaN(pstMode)) {
      return FLOW_THROUGH_VALUE;
    }

    return Number(pstMode);
  };

  const isFlowThrough = () => getResolvedPstMode() === FLOW_THROUGH_VALUE;
  const isDetectedFilterbank = () => getResolvedPstMode() === DETECTED_FILTER_BANK_VALUE;
  const isPulsarTiming = () => getResolvedPstMode() === PULSAR_TIMING_VALUE;

  const isContinuum = () =>
    getObservation()?.type === TYPE_CONTINUUM || getProposal()?.scienceCategory === TYPE_CONTINUUM;
  const isSpectral = () =>
    getObservation()?.type === TYPE_ZOOM ||
    getProposal()?.scienceCategory === TYPE_ZOOM ||
    getObservation()?.type === TYPE_CONTINUUM_SPECTRAL ||
    getProposal()?.scienceCategory === TYPE_CONTINUUM_SPECTRAL;
  const isPST = () =>
    getObservation()?.type === TYPE_PST || getProposal()?.scienceCategory === TYPE_PST;

  const isLow = () => getObservation()?.observingBand === BAND_LOW_STR;

  const showSC = osdCyclePolicy?.maxObservations === 1 && osdCyclePolicy?.maxDataProducts === 1;

  const getSuffix = () => {
    if (isContinuum() || isPST()) {
      const resolvedType = isPST()
        ? getDataProductType(getObservation()?.type ?? '', getResolvedPstMode())
        : dataProductType;
      return resolvedType.toString();
    }
    return '1';
  };

  const resetContinuumDataProduct = (
    dp: DataProductSDPNew,
    observation: Observation
  ): DataProductSDPNew => {
    // When the user changes between Images and Visibilities for the data product,
    // the hidden option still exists within the data model, and we need to set
    // its values to something sensible.
    if (getDataProductTypeValue(dp) === DP_TYPE_IMAGES) {
      const continuumImagesData = {
        ...dp,
        data: {
          ...dp.data,
          weighting: IW_BRIGGS,
          robust: ROBUST_DEFAULT,
          polarisations: POLARISATIONS_DEFAULT,
          channelsOut: CHANNELS_OUT_DEFAULT
        }
      };
      return updateImagesDataProductSizes(continuumImagesData, observation.centralFrequency);
    }

    const continuumVisibilityData = dp.data as SDPVisibilitiesContinuumData;
    return {
      ...dp,
      data: {
        ...continuumVisibilityData,
        dataProductType: DP_TYPE_VISIBLE,
        timeAveraging: 4,
        frequencyAveraging: 4
      }
    };
  };

  const updateLinkedDataProductId = (
    targetObservations: TargetObservation[],
    obsId: string,
    dataProductsSDPId: string
  ) =>
    targetObservations.map((rec) =>
      rec.observationId === obsId ? { ...rec, dataProductsSDPId } : rec
    );

  const dataProductIn = (dp: DataProductSDPNew) => {
    const data = dp.data as any;
    setId(dp.id);
    setObservationId(dp.observationId);
    setDataProductType(data?.dataProductType ?? DP_TYPE_IMAGES);
    setImageSizeValue(data?.imageSizeValue ?? IMAGE_SIZE_DEFAULT);
    setImageSizeUnits(data?.imageSizeUnits ?? IMAGE_SIZE_UNIT_DEFAULT);
    setPixelSizeValue(data?.pixelSizeValue ?? PIXEL_SIZE_DEFAULT);
    setPixelSizeUnits(data?.pixelSizeUnits ?? PIXEL_SIZE_UNIT_DEFAULT);
    isLow()
      ? setTaperLowValue(data?.taperValue ?? TAPER_DEFAULT)
      : setTaperMidValue(data?.taperValue ?? TAPER_DEFAULT);
    setWeighting(data?.weighting ?? IW_UNIFORM);
    setRobust(data?.robust ?? ROBUST_DEFAULT);
    setPolarisations(data?.polarisations ?? []);
    setChannelsOut(data?.channelsOut ?? channelsOutMax());
    setTimeAveraging(data?.timeAveraging ?? TIME_AVERAGING_DEFAULT);
    setFrequencyAveraging(data?.frequencyAveraging ?? FREQUENCY_AVERAGING_DEFAULT);
    setContinuumSubtraction(data?.continuumSubtraction ?? SET_CONTINUUM_SUBSTRACTION_DEFAULT);
    setBitDepth(data?.bitDepth ?? BIT_DEPTH_DEFAULT);
    setOutputFrequencyResolution(data?.outputFrequencyResolution ?? 1);
    setOutputSamplingInterval(data?.outputSamplingInterval ?? 1);
    setDispersionMeasure(data?.dispersionMeasure ?? 1);
    setRotationMeasure(data?.rotationMeasure ?? 1);
  };

  const dataProductOut = (): DataProductSDPNew | undefined => {
    if (!id || !hasRealObservationSelection()) {
      return undefined;
    }

    const taper = isLow() ? taperLowValue : taperMidValue;
    const newDataProduct: DataProductSDPNew = {
      id: id,
      observationId,
      data: {
        dataProductType,
        imageSizeValue,
        imageSizeUnits,
        pixelSizeValue,
        pixelSizeUnits,
        weighting,
        robust,
        polarisations,
        channelsOut,
        taperValue: taper,
        timeAveraging,
        frequencyAveraging,
        bitDepth,
        continuumSubtraction,
        outputFrequencyResolution,
        outputSamplingInterval,
        dispersionMeasure,
        rotationMeasure
      }
    };
    return newDataProduct;
  };

  /* ------------------------------------------- */

  // Combined mode's hidden visibilities ODP (see HiddenSDPData) is created automatically by the
  // SV auto-linking flow, but a data product added/edited manually here needs the same companion
  // - add it if this observation doesn't already have one.
  const ensureHiddenDataProduct = (
    dataProducts: DataProductSDPNew[],
    observation?: Observation
  ): DataProductSDPNew[] => {
    if (!observation || observation.type !== TYPE_CONTINUUM_SPECTRAL) {
      return dataProducts;
    }
    const alreadyHasHidden = dataProducts.some(
      (dp) => dp.observationId === observation.id && getDataProductTypeValue(dp) === DP_TYPE_VISIBLE
    );
    if (alreadyHasHidden) {
      return dataProducts;
    }
    const hiddenData = HiddenSDPData(observation);
    if (!hiddenData) {
      return dataProducts;
    }
    return [
      ...dataProducts,
      {
        id: generateDataProductId(),
        observationId: observation.id,
        data: hiddenData
      }
    ];
  };

  /**
   * Add Observation Data Products (ODPs) for both imaging and visabilities to the proposal.
   */
  const addToProposal = () => {
    if (!hasRealObservationSelection()) {
      return;
    }

    const proposal = getProposal();
    const observation = getObservation();
    const newDataProduct = dataProductOut();
    if (!newDataProduct) {
      return;
    }

    const dataProductSDP = ensureHiddenDataProduct(
      [...(proposal?.dataProductSDP ?? []), newDataProduct],
      observation
    );
    setProposal({
      ...proposal,
      dataProductSDP
    });
  };

  /**
   * Update the proposal's Observation Data Products (ODPs) for both imaging and visabilities.
   */
  const updateToProposal = () => {
    if (!hasRealObservationSelection()) {
      return;
    }
    const proposal = getProposal();
    const observation = getObservation();
    const newDataProduct = dataProductOut();
    if (!newDataProduct) {
      return;
    }
    const loaded = loadedDataProduct.current;
    loadedDataProduct.current = null;
    if (loaded?.id === newDataProduct.id && loaded.observationId === newDataProduct.observationId) {
      if (!hasSensCalcResults(proposal, newDataProduct.observationId)) {
        scheduleSensCalcUpdate(proposal, observation!, newDataProduct, setProposal, 0);
      }
      return;
    }
    const oldDataProducts = proposal.dataProductSDP ?? [];
    const dataProductSDP = ensureHiddenDataProduct(
      updateDataProducts(oldDataProducts, newDataProduct),
      observation
    );
    const proposalForSensCalc = {
      ...proposal,
      dataProductSDP
    };
    setProposal(proposalForSensCalc);
    scheduleSensCalcUpdate(proposalForSensCalc, observation!, newDataProduct, setProposal);
  };

  const updateStorageProposal = () => {
    if (osdCyclePolicy?.maxDataProducts === 1) {
      isEdit() ? updateToProposal() : addToProposal();
    }
  };

  // set correct default polarisations depending on data product type & pst mode from obs type
  const getDefaultPolarisations = (obsType: string, dataProductType: number): string[] => {
    if (obsType === TYPE_PST) {
      if (dataProductType === FLOW_THROUGH_VALUE) return ['X'];
      if (dataProductType === DETECTED_FILTER_BANK_VALUE) return ['I'];
      return [];
    }
    return ['I', 'XX'];
  };

  // set correct data product type depending on pst mode from obs type
  const getDataProductType = (obsType: string, pstMode?: number): number => {
    if (obsType === TYPE_PST) {
      if (typeof pstMode === 'undefined' || pstMode === null || Number.isNaN(pstMode)) {
        return FLOW_THROUGH_VALUE;
      }
      return Number(pstMode);
    }
    return DP_TYPE_IMAGES; // default for non-pst
  };

  const handleDataProductTypeChange = (nextType: string | number) => {
    const newDataProductType = Number(nextType);

    if (!isEdit() || newDataProductType === dataProductType) {
      setDataProductType(newDataProductType);
      return;
    }

    if (!isContinuum()) {
      setDataProductType(newDataProductType);
      return;
    }

    const proposal = getProposal();
    const observation = getObservation();

    if (!observation) {
      return;
    }

    const currentLinkedDataProduct = getLinkedDataProduct(observation.id, id) ?? dataProductOut();
    const currentDataProduct =
      currentLinkedDataProduct.id === id ? dataProductOut() : currentLinkedDataProduct;
    const nextLinkedDataProduct = getSiblingContinuumDataProduct(
      observation.id,
      currentDataProduct.id,
      newDataProductType
    );

    if (!nextLinkedDataProduct) {
      return;
    }

    const resetUnlinkedDataProduct = resetContinuumDataProduct(currentDataProduct, observation);
    const dataProductsAfterReset = updateDataProducts(
      updateDataProducts(proposal.dataProductSDP ?? [], resetUnlinkedDataProduct),
      nextLinkedDataProduct
    );
    const linkedTargetObservations = updateLinkedDataProductId(
      proposal.targetObservation ?? [],
      observation.id,
      nextLinkedDataProduct.id
    );
    const proposalForSensCalc: Proposal = {
      ...proposal,
      dataProductSDP: dataProductsAfterReset,
      targetObservation: linkedTargetObservations
    };
    setProposal(proposalForSensCalc);
    dataProductIn(nextLinkedDataProduct);
    scheduleSensCalcUpdate(proposalForSensCalc, observation, nextLinkedDataProduct, setProposal);
  };

  /* ------------------------------------------- */

  React.useEffect(() => {
    setHelp('observations.dp');
    const proposal = getProposal();
    const observations = proposal?.observations ?? [];

    setBaseObservations(observations);
    if (isEdit()) {
      const selectedDataProduct = data ? data : (locationProperties.state as DataProductSDPNew);
      const linkedDataProduct = getLinkedDataProduct(
        selectedDataProduct.observationId,
        selectedDataProduct.id
      );

      const dataProductToLoad = linkedDataProduct ?? selectedDataProduct;
      loadedDataProduct.current = dataProductToLoad;
      dataProductIn(dataProductToLoad);
    } else {
      const fallbackObservation =
        observations.find((obs) => obs.type === TYPE_PST) ?? observations[0];
      if (fallbackObservation?.id && !observationId) {
        setObservationId(fallbackObservation.id);
      }
      setId(generateDataProductId());
    }
  }, []);

  React.useEffect(() => {
    if (!polarisationsError) return;
    const timeout = setTimeout(() => {
      setPolarisationsError('');
    }, NOTIFICATION_DELAY_IN_SECONDS * 1000);
    return () => clearTimeout(timeout);
  }, [polarisationsError]);

  React.useEffect(() => {
    if (!isEdit()) {
      const sdpType = getDataProductType(getObservation()?.type ?? '', getResolvedPstMode());
      setDataProductType(sdpType);
      // channelsOut's initial state is set before an observation is selected (so isCombined()
      // can't see it yet) - re-derive it once the observation for this new data product is known.
      setChannelsOut(channelsOutMax());
    }
  }, [observationId]);

  React.useEffect(() => {
    if (!isEdit()) {
      const pol = getDefaultPolarisations(getObservation()?.type ?? '', dataProductType);
      setPolarisations(pol);
    }
  }, [dataProductType]);

  React.useEffect(() => {
    updateStorageProposal();
  }, [
    id,
    observationId,
    dataProductType,
    bitDepth,
    imageSizeValue,
    imageSizeUnits,
    pixelSizeValue,
    pixelSizeUnits,
    taperLowValue,
    taperMidValue,
    timeAveraging,
    frequencyAveraging,
    weighting,
    robust,
    channelsOut,
    continuumSubtraction,
    polarisations,
    outputFrequencyResolution,
    outputSamplingInterval,
    dispersionMeasure,
    rotationMeasure
  ]);

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const taperField = () => {
    return isLow()
      ? fieldWrapper(
          <TaperField
            disabled={isLow()}
            onFocus={() => setHelp('taper')}
            required
            setValue={setTaperLowValue}
            value={taperLowValue}
            suffix={t('taper.units')}
          />
        )
      : fieldWrapper(
          <TaperDropdown
            onFocus={() => setHelp('taper')}
            required
            setValue={setTaperMidValue}
            value={taperMidValue}
            suffix={t('taper.units')}
            centralFrequency={getCentralFrequency()}
          />
        );
  };

  const getCentralFrequency = () => {
    const obj = baseObservations.find((id) => id.id === observationId);
    const output: ValueUnitPair = {
      value: Number(obj?.centralFrequency) ?? 0,
      unit: obj?.centralFrequencyUnits.toString() ?? ''
    };
    return output;
  };

  const imageSizeUnitsField = () => {
    const getOptions = () => {
      return [0, 1, 2].map((e) => ({
        label: presentUnits(t('imageSize.' + e)),
        value: e
      }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId="frequencyUnits"
        value={imageSizeUnits}
        setValue={setImageSizeUnits}
        label=""
        onFocus={() => setHelp('frequencyUnits')}
      />
    );
  };

  const imageSizeField = () =>
    fieldWrapper(
      <ImageSizeField
        onFocus={() => setHelp('imageSize')}
        required
        setValue={setImageSizeValue}
        value={Number(imageSizeValue)}
        suffix={imageSizeUnitsField()}
      />
    );

  const timeAveragingField = () => {
    return fieldWrapper(
      <TimeAveragingField
        onFocus={() => setHelp('timeAveraging')}
        required
        setValue={setTimeAveraging}
        value={Number(timeAveraging)}
      />
    );
  };

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField
        onFocus={() => setHelp('frequencyAveraging')}
        required
        setValue={setFrequencyAveraging}
        value={Number(frequencyAveraging)}
      />
    );

  const pixelSizeUnitsField = () => {
    return pixelSizeUnits === 0 || pixelSizeUnits === null
      ? ''
      : presentUnits(t('pixelSize.' + pixelSizeUnits));
  };

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        onFocus={() => setHelp('pixelSize')}
        setValue={setPixelSizeValue}
        required
        value={pixelSizeValue}
        suffix={pixelSizeUnitsField()}
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        onFocus={() => setHelp('imageWeighting')}
        required
        setValue={setWeighting}
        value={weighting}
      />
    );

  const bitDepthField = () =>
    fieldWrapper(
      <BitDepthField
        onFocus={() => setHelp('bitDepth')}
        required
        setValue={setBitDepth}
        value={bitDepth}
      />
    );

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField
        observationType={getObservation()?.type || TYPE_CONTINUUM}
        onFocus={() => setHelp('dataProductType')}
        setValue={handleDataProductTypeChange}
        value={dataProductType}
      />
    );

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        onFocus={() => setHelp('robust')}
        setValue={setRobust}
        value={robust}
      />
    );

  const channelsOutField = () =>
    fieldWrapper(
      <ChannelsOutField
        maxValue={channelsOutMax()}
        onFocus={() => setHelp('channelsOut', { min: CHANNELS_OUT_MIN, max: channelsOutMax() })}
        required
        setValue={setChannelsOut}
        value={channelsOut}
      />
    );

  const continuumSubtractionField = () =>
    fieldWrapper(
      <ContinuumSubtractionField
        onFocus={() => setHelp('continuumSubtraction')}
        setValue={setContinuumSubtraction}
        value={continuumSubtraction}
      />
    );

  const polarisationsField = () => {
    return (
      <PolarisationsField
        onFocus={() => setHelp('polarisations')}
        observationType={getObservation()?.type || TYPE_CONTINUUM}
        dataProductType={dataProductType}
        value={polarisations}
        setError={setPolarisationsError}
        setValue={setPolarisations}
        labelWidth={0}
      />
    );
  };

  const outputFrequencyResolutionField = () =>
    fieldWrapper(
      <OutputFrequencyResolutionField
        required
        setValue={setOutputFrequencyResolution}
        value={outputFrequencyResolution}
      />
    );

  const outputSamplingIntervalField = () =>
    fieldWrapper(
      <OutputSamplingIntervalField
        required
        setValue={setOutputSamplingInterval}
        value={outputSamplingInterval}
      />
    );

  const dispersionMeasureField = () =>
    fieldWrapper(
      <DispersionMeasureField required setValue={setDispersionMeasure} value={dispersionMeasure} />
    );

  const rotationMeasureField = () =>
    fieldWrapper(
      <RotationMeasureField required setValue={setRotationMeasure} value={rotationMeasure} />
    );

  const imageSizeValid = () => Number(imageSizeValue) > 0;
  const pixelSizeValid = () => pixelSizeValue > 0;
  const taperSizeValid = () => taperLowValue >= 0;
  const taperMidSizeValid = () => taperMidValue >= 0;
  const channelsOutValid = () =>
    Number.isInteger(channelsOut) &&
    channelsOut >= CHANNELS_OUT_MIN &&
    channelsOut <= channelsOutMax();
  const polarisationsValid = () => polarisations.length > 0;

  const pageFooter = () => {
    /**
     * Update button is only enabled if the details pass basic validation.
     */
    const enabled = () => {
      if (!hasRealObservationSelection()) {
        return false;
      }

      switch (getObservation()?.type) {
        case TYPE_ZOOM:
        case TYPE_CONTINUUM_SPECTRAL:
          return (
            pixelSizeValid() &&
            imageSizeValid() &&
            taperMidSizeValid() &&
            taperSizeValid() &&
            channelsOutValid() &&
            polarisationsValid()
          );
        case TYPE_PST:
          if (isFlowThrough()) {
            return polarisationsValid();
          } else if (isDetectedFilterbank()) {
            return polarisationsValid();
          }
          return true;
        case TYPE_CONTINUUM:
        default:
          if (isDataTypeOne()) {
            return (
              pixelSizeValid() &&
              imageSizeValid() &&
              taperSizeValid() &&
              channelsOutValid() &&
              polarisationsValid()
            );
          } else {
            return true;
          }
      }
    };

    const buttonClicked = () => {
      isEdit() ? updateToProposal() : addToProposal();
      if (osdCyclePolicy?.maxDataProducts !== 1) {
        navigate(NAV[BACK_PAGE]);
      }
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT,
          left: 0,
          right: 0
        }}
        elevation={0}
      >
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid />
          <Grid />
          <Grid>
            <AddButton
              disabled={!enabled()}
              primary
              action={buttonClicked}
              testId={'addDataProductButtonEntry'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // These two functions only work for the SV call as they assume one target
  // and access the first element of an array. A better way here might be to find the
  // targetObservation that is linked to the id of the DataProduct (that is stored in this component state `id`)
  // and then use this to get the sensCalc and target. At the time of writing, that isn't a
  // ball of string I want to start pulling..
  const scData = (): any => getProposal()?.targetObservation?.[0]?.sensCalc;
  const isTargetSSO = (): boolean => {
    const proposal = getProposal();
    return proposal.targets?.[0]?.kind === REFERENCE_COORDINATE_TYPE_SSO.value;
  };
  const linkedScData = (): any =>
    getProposal()?.targetObservation?.find((rec) => rec.observationId === observationId)?.sensCalc;

  const isCustom = () => getObservation()?.subarray === SA_CUSTOM;
  const isNatural = () =>
    isSpectral() || (isContinuum() && isDataTypeOne()) ? weighting === IW_NATURAL : false;

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        minHeight: 0
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={GAP}
        m={GAP}
        mt={1}
        sx={{ flexGrow: 1 }}
      >
        <Grid size={{ md: 4, lg: 2 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <BorderedSection title={t('page.7.obsTitle')}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: '#ccc',
                borderRadius: '8px',
                minHeight: 0,
                maxHeight: 'calc(100vh - 260px)',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              {baseObservations && (
                <GridObservation
                  data={baseObservations}
                  autoSelectId={observationId}
                  rowClick={(e: any) => setObservationId(e.row.id)}
                  disabled={maxObservationsReached()}
                />
              )}
            </Box>
          </BorderedSection>
        </Grid>
        <Grid size={{ md: 7, lg: 7 }}>
          <Stack spacing={GAP}>
            {isContinuum() && <Box sx={{ width: '500px' }}>{dataProductTypeField()}</Box>}

            {isContinuum() && (
              <BorderedSection title={t('page.7.group.' + TYPE_CONTINUUM + '.' + dataProductType)}>
                {isDataTypeOne() && (
                  <Grid pb={1} container spacing={GAP}>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(imageWeightingField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(taperField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                  </Grid>
                )}
                {!isDataTypeOne() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(timeAveragingField())}</Grid>
                    <Grid size={{ md: COL_MID }}>{fieldWrapper(frequencyAveragingField())}</Grid>
                  </Grid>
                )}
              </BorderedSection>
            )}

            {isSpectral() && (
              <BorderedSection title={t('page.7.group.' + TYPE_ZOOM)}>
                <Grid pb={1} container spacing={GAP}>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageSizeField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(pixelSizeField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(imageWeightingField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>
                    {weighting === IW_BRIGGS && fieldWrapper(robustField())}
                  </Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(taperField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(channelsOutField())}</Grid>
                  <Grid size={{ md: COL_MID, lg: COL }}>
                    {fieldWrapper(continuumSubtractionField())}
                  </Grid>
                </Grid>
              </BorderedSection>
            )}

            {isPST() && (
              <BorderedSection title={t('page.7.group.' + TYPE_PST + '.' + dataProductType)}>
                {isFlowThrough() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(bitDepthField())}</Grid>
                  </Grid>
                )}
                {isPulsarTiming() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {<TickIcon onClick={() => {}} />}All set!
                    </Grid>
                  </Grid>
                )}
                {isDetectedFilterbank() && (
                  <Grid pb={1} container>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(outputFrequencyResolutionField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(outputSamplingIntervalField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>{fieldWrapper(bitDepthField())}</Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(dispersionMeasureField())}
                    </Grid>
                    <Grid size={{ md: COL_MID, lg: COL }}>
                      {fieldWrapper(rotationMeasureField())}
                    </Grid>
                  </Grid>
                )}
              </BorderedSection>
            )}

            {((isContinuum() && isDataTypeOne()) ||
              isSpectral() ||
              (isPST() && !isPulsarTiming())) && (
              <Box pb={GAP}>
                <BorderedSection
                  borderColor={
                    polarisationsValid() && polarisationsError.length === 0
                      ? 'text.disabled'
                      : theme.palette.error.main
                  }
                  title={
                    polarisationsError.length > 0 ? polarisationsError : t('polarisations.label')
                  }
                >
                  {fieldWrapper(
                    polarisationsField(),
                    (isContinuum() && isDataTypeOne()) || isSpectral() ? '150px' : undefined
                  )}
                </BorderedSection>
              </Box>
            )}
          </Stack>
        </Grid>

        <Grid size={{ md: 11, lg: 3 }}>
          <BorderedSection borderColor={theme.palette.info.main} title={t('page.7.descTitle')}>
            <Typography variant="subtitle1">
              {t('page.7.descContent.' + getObservation()?.type + '.' + getSuffix())
                .split('\n')
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {line.trim()}
                    <br />
                  </React.Fragment>
                ))}
            </Typography>
          </BorderedSection>
          {showSC && <Spacer size={GAP * 2} axis={SPACER_VERTICAL} />}
          {showSC && (
            <BorderedSection
              borderColor={
                isPST() || isTargetSSO()
                  ? theme.palette.warning.main
                  : scData()?.statusGUI !== STATUS_INITIAL
                    ? theme.palette.success.main
                    : theme.palette.error.main
              }
              title={t('sensitivityCalculatorResults.title')}
            >
              {isPST() && <Typography variant="subtitle1">{t('page.7.pstUnavailable')}</Typography>}
              {!isPST() && (
                <SensCalcContent
                  data={linkedScData() ?? scData()}
                  isSSO={isTargetSSO()}
                  isCustom={isCustom()}
                  isNatural={isNatural()}
                />
              )}
            </BorderedSection>
          )}
        </Grid>
      </Grid>
      {osdCyclePolicy?.maxDataProducts !== 1 && pageFooter()}
    </Box>
  );
}
