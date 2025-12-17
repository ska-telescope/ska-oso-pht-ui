import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useTheme } from '@mui/material/styles';
import {
  DropDown,
  FrequencySpectrum,
  getColors,
  NumberEntry,
  Spacer,
  SPACER_VERTICAL,
  TextEntry,
  BorderedSection
} from '@ska-telescope/ska-gui-components';
import {
  LAB_IS_BOLD,
  LAB_POSITION,
  NAV,
  BAND_LOW,
  SUPPLIED_VALUE_DEFAULT_MID,
  TYPE_CONTINUUM,
  OB_SUBARRAY_CUSTOM,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_INTEGRATION_TIME_UNITS_S,
  SUPPLIED_VALUE_DEFAULT_LOW,
  FREQUENCY_UNITS,
  FREQUENCY_MHZ,
  FREQUENCY_GHZ,
  FOOTER_SPACER,
  WRAPPER_HEIGHT,
  TYPE_ZOOM,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  OB_SUBARRAY_AA2,
  FOOTER_HEIGHT_PHT,
  PAGE_OBSERVATION,
  PAGE_OBSERVATION_UPDATE,
  PAGE_OBSERVATION_ADD,
  DETAILS,
  FREQUENCY_HZ,
  ZOOM_BANDWIDTH_DEFAULT_LOW,
  ZOOM_CHANNELS_MAX,
  TYPE_PST,
  FLOW_THROUGH_VALUE,
  ZOOM_BANDWIDTH_DEFAULT_MID,
  TELESCOPES,
  TEL_UNITS
} from '@utils/constants.ts';
import {
  frequencyConversion,
  generateId,
  getBandwidthLowZoom,
  getBandwidthZoom,
  getMinimumChannelWidth
} from '@utils/helpers.ts';
import PageBannerPPT from '../../../components/layout/pageBannerPPT/PageBannerPPT';
import Proposal from '../../../utils/types/proposal';
import AddButton from '../../../components/button/Add/Add';
import GroupObservationsField from '../../../components/fields/groupObservations/groupObservations';
import Observation from '../../../utils/types/observation';
import SubArrayField from '../../../components/fields/subArray/SubArray';
import ObservingBandField from '../../../components/fields/observingBand/ObservingBand';
import ObservationTypeField from '../../../components/fields/observationType/ObservationType';
import EffectiveResolutionField from '../../../components/fields/effectiveResolution/EffectiveResolution';
import ElevationField, { ELEVATION_DEFAULT } from '../../../components/fields/elevation/Elevation';
import SpectralAveragingField from '../../../components/fields/spectralAveraging/SpectralAveraging';
import SpectralResolutionField from '../../../components/fields/spectralResolution/SpectralResolution';
import NumStations from '../../../components/fields/numStations/NumStations';
import ContinuumBandwidthField from '../../../components/fields/bandwidthFields/continuumBandwidth/continuumBandwidth';
import BandwidthField from '../../../components/fields/bandwidthFields/bandwidth/bandwidth';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import {
  calculateCentralFrequency,
  calculateContinuumBandwidth
} from '@/utils/calculate/calculate';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import PstModeField from '@/components/fields/pstMode/PstMode';
import { useHelp } from '@/utils/help/useHelp';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';
import SuppliedValue from '@/components/fields/suppliedValue/suppliedValue';
import CentralFrequency from '@/components/fields/centralFrequency/centralFrequency';
import ZoomChannels from '@/components/fields/zoomChannels/zoomChannels';
import SubBands from '@/components/fields/subBands/subBands';
import updateObservations from '@/utils/update/observations/updateObservations';
import updateDataProductsPST from '@/utils/update/dataProductsPST/updateDataProductsPST';
import updateSensCalcPartial from '@/utils/update/sensCalcPartial/updateSensCalcPartial';
import updateSensCalc from '@/utils/update/sensCalc/updateSensCalc';
import { DataProductSDP } from '@/utils/types/dataProduct';

const TOP_LABEL_WIDTH = 6;
const BOTTOM_LABEL_WIDTH = 4;
const LABEL_WIDTH_NEW = 5.5;
const BACK_PAGE = PAGE_OBSERVATION;
const IMAGE_PATH =
  window.location.hostname === 'localhost' ? '/assets/low_aa2.png' : './assets/low_aa2.png';

interface ObservationEntryProps {
  data?: Observation;
}

export default function ObservationEntry({ data }: ObservationEntryProps) {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const locationProperties = useLocation();
  const loggedIn = isLoggedIn();
  const { isSV } = useAppFlow();
  const { osdLOW, osdMID, observatoryConstants, osdCyclePolicy } = useOSDAccessors();

  const isEdit = () => locationProperties.state !== null || data !== undefined;

  const PAGE = isEdit() ? PAGE_OBSERVATION_UPDATE : PAGE_OBSERVATION_ADD;

  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(3);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(1);
  const [effectiveResolution, setEffectiveResolution] = React.useState('');
  const [elevation, setElevation] = React.useState(ELEVATION_DEFAULT[TELESCOPE_LOW_NUM - 1]);
  const [weather, setWeather] = React.useState(Number(t('weather.default')));
  const [centralFrequency, setCentralFrequency] = React.useState(0);
  const [centralFrequencyUnits, setCentralFrequencyUnits] = React.useState(FREQUENCY_MHZ);
  const [bandwidth, setBandwidth] = React.useState(ZOOM_BANDWIDTH_DEFAULT_LOW);
  const [bandwidthLookup, setBandwidthLookup] = React.useState<
    { label: string; value: number; mapping: string } | undefined
  >(undefined);
  const [spectralAveraging, setSpectralAveraging] = React.useState(1);
  const [spectralResolution, setSpectralResolution] = React.useState('');
  const [suppliedType, setSuppliedType] = React.useState(1);
  const [suppliedValue, setSuppliedValue] = React.useState(SUPPLIED_VALUE_DEFAULT_LOW);
  const [suppliedUnits, setSuppliedUnits] = React.useState(SUPPLIED_INTEGRATION_TIME_UNITS_H);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState(0);
  const [continuumBandwidthUnits, setContinuumBandwidthUnits] = React.useState(2);
  const [subBands, setSubBands] = React.useState(1);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState<number | undefined>(4);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState<number | undefined>(0);
  const [numOfStations, setNumOfStations] = React.useState<number | undefined>(512);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [minimumChannelWidthHz, setMinimumChannelWidthHz] = React.useState<number>(0);
  const [zoomChannels, setZoomChannels] = React.useState<number>(ZOOM_CHANNELS_MAX);
  const [pstMode, setPstMode] = React.useState(FLOW_THROUGH_VALUE);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [myObsId, setMyObsId] = React.useState('');
  const [once, setOnce] = React.useState<Observation | null>(null);
  const isAA2 = (subarrayConfig: number) => subarrayConfig === OB_SUBARRAY_AA2;

  const observationIn = (ob: Observation) => {
    setMyObsId(ob?.id);
    setSubarrayConfig(ob?.subarray);
    setObservationType(isSV() ? (getObservationType() as number) : ob.type); // TODO this should not be needed
    if (!once) setObservingBand(ob?.observingBand);
    setWeather(ob?.weather ?? Number(t('weather.default')));
    setElevation(ob?.elevation);
    setCentralFrequency(ob?.centralFrequency);
    setCentralFrequencyUnits(ob?.centralFrequencyUnits);
    setBandwidth(
      ob?.bandwidth ?? (isLow() ? ZOOM_BANDWIDTH_DEFAULT_LOW : ZOOM_BANDWIDTH_DEFAULT_MID)
    );
    setContinuumBandwidth(ob?.continuumBandwidth ?? 0);
    setContinuumBandwidthUnits(ob?.continuumBandwidthUnits ?? 0);
    setSpectralAveraging(ob?.spectralAveraging ?? 1);
    setSuppliedType(ob?.supplied.type);
    setSuppliedValue(ob?.supplied.value);
    setSuppliedUnits(ob?.supplied.units);
    setSubBands(ob?.numSubBands ?? 0);
    setNumOf15mAntennas(ob?.num15mAntennas ?? 0);
    setNumOf13mAntennas(ob?.num13mAntennas ?? 0);
    setNumOfStations(ob?.numStations ?? 0);
    setZoomChannels(ob?.zoomChannels ?? 0);
    setPstMode(ob?.pstMode ?? 0);
  };

  const observationOut = () => {
    const newObservation: Observation = {
      id: myObsId,
      telescope: telescope(),
      subarray: subarrayConfig,
      linked: '0',
      type: observationType,
      observingBand,
      weather,
      elevation: elevation,
      centralFrequency: Number(centralFrequency),
      centralFrequencyUnits: centralFrequencyUnits,
      bandwidth: bandwidth,
      continuumBandwidth: continuumBandwidth,
      continuumBandwidthUnits: continuumBandwidthUnits,
      spectralAveraging: (Number.isNaN(spectralAveraging) ? 1 : spectralAveraging) ?? 1,
      supplied: {
        type: suppliedType,
        value: suppliedValue,
        units: suppliedUnits
      },
      spectralResolution,
      effectiveResolution,
      numSubBands: subBands,
      num15mAntennas: numOf15mAntennas,
      num13mAntennas: numOf13mAntennas,
      numStations: numOfStations,
      zoomChannels: zoomChannels,
      pstMode: pstMode
    };
    return newObservation;
  };

  /*--------------------------------------------------*/

  const updateObservationOnProposal = async () => {
    const proposal = getProposal();
    const newObservation: Observation = observationOut();
    const oldObservations = proposal.observations ?? [];
    const oldDataProducts = proposal.dataProductSDP ?? [];
    const dataProductSDP: DataProductSDP | undefined = proposal.dataProductSDP?.find(
      dp => dp.observationId === newObservation.id
    );
    const oldTO = proposal?.targetObservation ?? [];
    const to =
      isSV() && dataProductSDP
        ? await updateSensCalc(proposal, newObservation, dataProductSDP)
        : updateSensCalcPartial(oldTO, newObservation);

    const tmp = {
      ...proposal,
      observations: updateObservations(oldObservations ?? [], newObservation),
      dataProductSDP: updateDataProductsPST(oldDataProducts, newObservation),
      targetObservation: to
    };
    setProposal(tmp);
  };

  const addObservationToProposal = () => {
    const newObservation: Observation = observationOut();
    setProposal({
      ...getProposal(),
      observations: [...(getProposal().observations ?? []), newObservation]
    });
  };

  const updateStorageProposal = () => {
    if (loggedIn && osdCyclePolicy.maxObservations === 1) {
      isEdit() ? updateObservationOnProposal() : addObservationToProposal();
    }
  };

  const getObservationType = () => {
    if (getProposal() && typeof getProposal()?.scienceCategory === 'number') {
      const obsType = DETAILS.ObservingMode.find(
        item => item.value === getProposal()?.scienceCategory
      )?.observationType;
      return obsType;
    }
  };

  // Change the central frequency & units only if they are currently the same as the existing defaults
  const setDefaultCentralFrequency = (inBand: number, inSubArray: number) => {
    if (
      Number(centralFrequency) ===
        calculateCentralFrequency(observingBand, subarrayConfig, observatoryConstants) &&
      centralFrequencyUnits === (isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ)
    ) {
      setCentralFrequency(calculateCentralFrequency(inBand, inSubArray, observatoryConstants));
      setCentralFrequencyUnits(inBand === BAND_LOW ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  };

  // Change the continuum bandwidth & units only if they are currently the same as the existing defaults
  const setDefaultContinuumBandwidth = (inBand: number, inSubArray: number) => {
    if (
      isContinuum() &&
      Number(continuumBandwidth) ===
        calculateContinuumBandwidth(observingBand, subarrayConfig, observatoryConstants) &&
      continuumBandwidthUnits === (isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ)
    ) {
      setContinuumBandwidth(calculateContinuumBandwidth(inBand, inSubArray, observatoryConstants));
      setContinuumBandwidthUnits(inBand === BAND_LOW ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  };

  const setDefaultElevation = () => {
    if (elevation === ELEVATION_DEFAULT[(isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM) - 1]) {
      setElevation(ELEVATION_DEFAULT[telescope() - 1]);
    }
  };

  const validateId = () =>
    getProposal()?.observations?.find(t => t.id === myObsId) ? t('observationId.notUnique') : '';

  const setTheObservingBand = (e: React.SetStateAction<number>) => {
    if (isLow() && e !== 0) {
      setDefaultElevation();
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_S);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_MID);
    }
    if (isMid() && e === 0) {
      setDefaultElevation();
      setSuppliedType(1); // TODO : Replace with constant
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_H);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_LOW);
    }

    setDefaultCentralFrequency(e as number, subarrayConfig);
    setDefaultContinuumBandwidth(e as number, subarrayConfig);
    setObservingBand(e);
    updateStorageProposal();
  };

  const setTheSubarrayConfig = (e: React.SetStateAction<number>) => {
    const record = observatoryConstants.array[telescope() - 1].subarray.find(
      element => element.value === e
    );
    if (record) {
      //Set value using OSD Data if Low AA2
      if (isLow() && isAA2(record.value)) {
        setNumOfStations(osdLOW?.AA2?.numberStations ?? undefined);
      } else {
        setNumOfStations(record.numOfStations);
      }
      //Set value using OSD Data if Mid AA2
      if (isMid() && isAA2(record.value)) {
        setNumOf15mAntennas(osdMID?.AA2?.numberSkaDishes ?? undefined);
      } else {
        setNumOf15mAntennas(record.numOf15mAntennas);
      }
    }
    setNumOf13mAntennas(record?.numOf13mAntennas);
    setDefaultCentralFrequency(observingBand, e as number);
    setDefaultContinuumBandwidth(observingBand, e as number);
    setSubarrayConfig(e);
    updateStorageProposal();
  };

  React.useEffect(() => {
    setHelp('observationId');
    if (isEdit()) {
      observationIn(data ? data : locationProperties.state);
      setOnce(data ? data : locationProperties.state);
    } else {
      setMyObsId(generateId(t('addObservation.idPrefix'), 6));
      setCentralFrequency(
        calculateCentralFrequency(observingBand, subarrayConfig, observatoryConstants)
      );
      setCentralFrequencyUnits(isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
      setContinuumBandwidth(
        calculateContinuumBandwidth(observingBand, subarrayConfig, observatoryConstants)
      );
      setContinuumBandwidthUnits(isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  }, []);

  React.useEffect(() => {
    if (isContinuumOnly()) {
      setObservationType(TYPE_CONTINUUM);
    }
    setValidateToggle(!validateToggle);
  }, [subarrayConfig]);

  React.useEffect(() => {
    setBandwidthLookup(getBandwidthLowZoom(bandwidth));
  }, [bandwidth]);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
    updateStorageProposal();
  }, [
    groupObservation,
    elevation,
    weather,
    suppliedType,
    suppliedValue,
    suppliedUnits,
    centralFrequency,
    centralFrequencyUnits,
    continuumBandwidth,
    subBands,
    numOf15mAntennas,
    numOf13mAntennas,
    numOfStations,
    pstMode
  ]);

  React.useEffect(() => {
    const calculateSubarray = () => {
      if (isEdit()) {
        return;
      }
      setSubarrayConfig(subarrayConfig);
    };

    const setFrequencyUnits = () => {
      if (isLow()) {
        setCentralFrequencyUnits(FREQUENCY_MHZ);
      }
    };

    if (once) {
      // We just need to do this one more time as some fields could not be updated until observingBand has changed.
      observationIn(once);
      setOnce(null);
      setDefaultCentralFrequency(observingBand, subarrayConfig);
      setDefaultContinuumBandwidth(observingBand, subarrayConfig);
    }
    const calculateMinimumChannelWidthHz = () =>
      setMinimumChannelWidthHz(getMinimumChannelWidth(telescope()));

    calculateSubarray();
    setFrequencyUnits();
    calculateMinimumChannelWidthHz();
  }, [observingBand]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isZoom = () => observationType === TYPE_ZOOM;
  const isPST = () => observationType === TYPE_PST;
  const isLow = () => observingBand === BAND_LOW;
  const isMid = () => observingBand !== BAND_LOW;
  const telescope = () => (isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM);
  const isLowAA2 = () => isLow() && subarrayConfig === OB_SUBARRAY_AA2;
  const isContinuumOnly = () => observingBand !== 0 && subarrayConfig === OB_SUBARRAY_AA2;

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const suppliedWrapper = (children: React.JSX.Element) => (
    <Box p={0} pl={1} pr={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const emptyField = () => <></>;

  /******************************************************/

  const idField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <TextEntry
          disabled={isEdit()}
          errorText={isEdit() ? '' : validateId()}
          label={t('observationId.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH_NEW}
          onFocus={() => setHelp('observationId')}
          required
          testId="observationId"
          value={myObsId}
          setValue={setMyObsId}
        />
      </Box>
    );
  };

  const groupObservationsField = () =>
    fieldWrapper(
      <GroupObservationsField
        labelWidth={LABEL_WIDTH_NEW}
        onFocus={() => setHelp('groupObservations')}
        setValue={setGroupObservation}
        value={groupObservation}
        obsId={myObsId}
      />
    );

  const frequencySpectrumField = () => {
    const colors = getColors({
      type: 'telescope',
      colors: TELESCOPES[telescope() - 1].label.toLowerCase(),
      content: 'bg',
      dim: 0.6,
      asArray: true
    }) ?? [theme.palette.primary.main, theme.palette.primary.contrastText];

    let min = 0;
    let max = 0;
    if (isMid()) {
      const receiver = osdMID?.basicCapabilities?.receiverInformation.find(
        e => e.rxId === String(observingBand)
      );
      min = receiver?.minFrequencyHz ?? 0;
      max = receiver?.maxFrequencyHz ?? 0;
    } else {
      min = osdLOW?.basicCapabilities?.minFrequencyHz ?? 0;
      max = osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0;
    }
    const minFreq = frequencyConversion(min, FREQUENCY_HZ, isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    const maxFreq = frequencyConversion(max, FREQUENCY_HZ, isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    const cenFreq = frequencyConversion(
      centralFrequency ?? 0,
      centralFrequencyUnits ?? FREQUENCY_HZ,
      isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
    );

    return fieldWrapper(
      <Box>
        <FrequencySpectrum
          minFreq={minFreq}
          maxFreq={maxFreq}
          centerFreq={cenFreq}
          bandWidth={
            isContinuum() || isPST()
              ? continuumBandwidth ?? 0
              : frequencyConversion(
                  isLow() ? bandwidthLookup?.value ?? 0 : getBandwidthZoom(observationOut()),
                  isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ,
                  FREQUENCY_MHZ
                ) ?? 0
          }
          bandColor={colors[isLow() ? 0 : 1]}
          boxWidth="100%"
          unit={TEL_UNITS[isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM]}
        />
      </Box>
    );
  };

  const observationsBandField = () =>
    fieldWrapper(
      <ObservingBandField
        disabled={osdCyclePolicy.bands.length < 2}
        widthLabel={LABEL_WIDTH_NEW}
        required
        value={observingBand}
        setValue={setTheObservingBand}
      />
    );

  const subArrayField = () =>
    fieldWrapper(
      <SubArrayField
        observingBand={observingBand}
        required
        widthLabel={LABEL_WIDTH_NEW}
        telescope={telescope()}
        value={subarrayConfig}
        setValue={setTheSubarrayConfig}
      />
    );

  const pstModeField = () =>
    fieldWrapper(
      <PstModeField required widthLabel={LABEL_WIDTH_NEW} value={pstMode} setValue={setPstMode} />
    );

  const numStationsField = () =>
    fieldWrapper(
      <NumStations
        disabled={subarrayConfig !== OB_SUBARRAY_CUSTOM}
        widthLabel={LABEL_WIDTH_NEW}
        setValue={setNumOfStations}
        value={numOfStations ?? 0}
        rangeLower={Number(t('numStations.range.lower'))}
        rangeUpper={Number(t('numStations.range.upper'))}
      />
    );

  const antennasFields = () => {
    const NumOf15mAntennasField = () => {
      const validate = (e: number) => {
        const num = Number(Math.abs(e).toFixed(0));
        if (num < Number(t('numOf15mAntennas.range.lower'))) {
          setNumOf15mAntennas(Number(t('numOf15mAntennas.range.lower')));
        } else if (num > Number(t('numOf15mAntennas.range.upper'))) {
          setNumOf15mAntennas(Number(t('numOf15mAntennas.range.upper')));
        } else {
          setNumOf15mAntennas(num);
        }
      };

      return (
        <NumberEntry
          disabled={subarrayConfig !== 20}
          disabledUnderline={subarrayConfig !== 20}
          label={t('numOf15mAntennas.short')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={BOTTOM_LABEL_WIDTH}
          testId="numOf15mAntennas"
          value={numOf15mAntennas}
          setValue={validate}
          onFocus={() => setHelp('numOf15mAntennas')}
        />
      );
    };

    const numOf13mAntennasField = () => {
      const validate = (e: number) => {
        const num = Number(Math.abs(e).toFixed(0));
        if (num < Number(t('numOf13mAntennas.range.lower'))) {
          setNumOf13mAntennas(Number(t('numOf13mAntennas.range.lower')));
        } else if (num > Number(t('numOf13mAntennas.range.upper'))) {
          setNumOf13mAntennas(Number(t('numOf13mAntennas.range.upper')));
        } else {
          setNumOf13mAntennas(num);
        }
      };

      return (
        <NumberEntry
          disabled={subarrayConfig !== 20}
          disabledUnderline={subarrayConfig !== 20}
          label={t('numOf13mAntennas.short')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={BOTTOM_LABEL_WIDTH}
          testId="numOf13mAntennas"
          value={numOf13mAntennas}
          setValue={validate}
          onFocus={() => setHelp('numOf13mAntennas')}
        />
      );
    };

    return fieldWrapper(
      <Grid container direction="row">
        <Grid pt={2} size={{ xs: TOP_LABEL_WIDTH }}>
          <InputLabel disabled={subarrayConfig !== 20} shrink={false} htmlFor="numOf15mAntennas">
            <Typography
              sx={{ fontWeight: subarrayConfig === OB_SUBARRAY_CUSTOM ? 'bold' : 'normal' }}
            >
              {t('numOfAntennas.label')}
            </Typography>
          </InputLabel>
        </Grid>
        <Grid size={{ xs: 3 }}>{NumOf15mAntennasField()}</Grid>
        <Grid size={{ xs: 3 }}>{numOf13mAntennasField()}</Grid>
      </Grid>
    );
  };

  const elevationField = () =>
    fieldWrapper(
      <ElevationField
        isLow={isLow()}
        label={t('elevation.label')}
        widthLabel={LABEL_WIDTH_NEW}
        onFocus={() => setHelp('elevation')}
        setValue={setElevation}
        testId="elevation"
        value={elevation}
      />
    );

  const weatherField = () => {
    const errorMessage = () => {
      const min = Number(t('weather.range.lower'));
      const max = Number(t('weather.range.upper'));
      return weather < min || weather > max ? t('weather.range.error') : '';
    };

    const weatherUnitsField = () => t('weather.units');

    return fieldWrapper(
      <Box pt={1}>
        <NumberEntry
          disabled={isLow()}
          errorText={errorMessage()}
          label={t('weather.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={TOP_LABEL_WIDTH}
          testId="weather"
          value={weather}
          setValue={setWeather}
          onFocus={() => setHelp('weather')}
          suffix={weatherUnitsField()}
        />
      </Box>
    );
  };

  /**************************************************************/

  const observationTypeField = () =>
    fieldWrapper(
      <ObservationTypeField
        disabled={
          (loggedIn && osdCyclePolicy?.maxTargets === 1 && osdCyclePolicy?.maxObservations === 1) ||
          isContinuumOnly()
        }
        isContinuumOnly={isContinuumOnly()}
        widthLabel={LABEL_WIDTH_NEW}
        required
        value={observationType}
        setValue={setObservationType}
      />
    );

  const suppliedField = () => {
    const suppliedTypeField = () => {
      const getOptions = () =>
        isLow() ? [observatoryConstants?.Supplied[0]] : observatoryConstants?.Supplied;
      return (
        <Box pt={1}>
          <DropDown
            options={getOptions()}
            testId="suppliedType"
            value={suppliedType}
            setValue={setSuppliedType}
            disabled={getOptions()?.length < 2}
            label=""
            onFocus={() => setHelp('suppliedType')}
            required
          />
        </Box>
      );
    };

    const suppliedUnitsField = () => {
      const getOptions = () => {
        return suppliedType && suppliedType > 0
          ? observatoryConstants.Supplied[suppliedType - 1].units
          : [];
      };

      return (
        <Box>
          <DropDown
            options={getOptions()}
            testId="suppliedUnits"
            value={suppliedUnits}
            disabled={isLow()}
            setValue={setSuppliedUnits}
            label=""
            onFocus={() => setHelp('suppliedUnits')}
            InputProps={{ disableUnderline: true }}
          />
        </Box>
      );
    };

    return suppliedWrapper(
      <Grid pt={0} m={0} container justifyContent="space-between" direction="row">
        <Grid pt={1} pr={1} size={{ md: 5 }}>
          {suppliedTypeField()}
        </Grid>
        <Grid p={0} pt={2} size={{ md: 10 - BOTTOM_LABEL_WIDTH }} justifySelf="flex-end">
          <Box ml={-3}>
            <SuppliedValue
              value={suppliedValue}
              setValue={setSuppliedValue}
              suffix={suppliedUnitsField()}
              required
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  const zoomChannelsField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <ZoomChannels
          labelWidth={LABEL_WIDTH_NEW}
          required
          value={zoomChannels}
          setValue={setZoomChannels}
        />
      </Box>
    );
  };

  const centralFrequencyField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <CentralFrequency
          bandWidth={isContinuum() ? continuumBandwidth : bandwidth}
          labelWidth={LABEL_WIDTH_NEW}
          observingBand={observingBand}
          value={centralFrequency}
          setValue={setCentralFrequency}
          suffix={centralFrequencyUnitsField()}
          required
        />
      </Box>
    );
  };

  const continuumBandwidthField = () => {
    const continuumBandwidthUnitsField = () => {
      // Only have MHz for Low
      const options = isLow() ? [FREQUENCY_UNITS[1]] : FREQUENCY_UNITS;
      return (
        <DropDown
          options={options}
          testId="continuumBandwidthUnits"
          value={continuumBandwidthUnits}
          setValue={setContinuumBandwidthUnits}
          label=""
          disabled={options?.length === 1}
          onFocus={() => setHelp('frequencyUnits')}
        />
      );
    };
    return fieldWrapper(
      <ContinuumBandwidthField
        labelWidth={LABEL_WIDTH_NEW}
        setValue={setContinuumBandwidth}
        value={continuumBandwidth}
        suffix={continuumBandwidthUnitsField()}
        telescope={telescope()}
        observingBand={observingBand}
        continuumBandwidthUnits={continuumBandwidthUnits}
        centralFrequency={centralFrequency}
        centralFrequencyUnits={centralFrequencyUnits}
        subarrayConfig={subarrayConfig}
        minimumChannelWidthHz={minimumChannelWidthHz}
      />
    );
  };

  const bandwidthField = () => (
    <Grid>
      {fieldWrapper(
        <BandwidthField
          required
          setValue={setBandwidth}
          value={bandwidth}
          telescope={telescope()}
          widthLabel={LABEL_WIDTH_NEW}
          observingBand={observingBand}
          centralFrequency={centralFrequency}
          centralFrequencyUnits={centralFrequencyUnits}
          subarrayConfig={subarrayConfig}
          minimumChannelWidthHz={minimumChannelWidthHz}
        />
      )}
    </Grid>
  );

  const spectralResolutionField = () =>
    fieldWrapper(
      <SpectralResolutionField
        bandWidth={isContinuum() ? continuumBandwidth : bandwidth}
        bandWidthUnits={isContinuum() ? continuumBandwidthUnits : isLow() ? 3 : 2}
        frequency={centralFrequency}
        frequencyUnits={centralFrequencyUnits}
        label={t('spectralResolution.label')}
        labelWidth={LABEL_WIDTH_NEW}
        observingBand={observingBand}
        observationType={observationType}
        onFocus={() => setHelp('spectralResolution')}
        setValue={setSpectralResolution}
      />
    );

  const spectralAveragingField = () =>
    fieldWrapper(
      <SpectralAveragingField
        isLow={isLow()}
        labelWidth={LABEL_WIDTH_NEW}
        value={spectralAveraging}
        setValue={setSpectralAveraging}
        subarray={subarrayConfig}
        type={observationType}
      />
    );

  const effectiveResolutionField = () =>
    fieldWrapper(
      <EffectiveResolutionField
        label={t('effectiveResolution.label')}
        labelWidth={LABEL_WIDTH_NEW}
        frequency={centralFrequency}
        frequencyUnits={centralFrequencyUnits}
        spectralAveraging={spectralAveraging}
        spectralResolution={spectralResolution}
        observingBand={observingBand}
        observationType={observationType}
        onFocus={() => setHelp('effectiveResolution')}
        setValue={setEffectiveResolution}
      />
    );

  const centralFrequencyUnitsField = () => {
    // Only have MHz for Low
    const options = isLow() ? [FREQUENCY_UNITS[1]] : FREQUENCY_UNITS;
    return (
      <DropDown
        options={options}
        testId="frequencyUnits"
        value={centralFrequencyUnits}
        setValue={setCentralFrequencyUnits}
        label=""
        disabled={options?.length === 1}
        onFocus={() => setHelp('frequencyUnits')}
      />
    );
  };

  const SubBandsField = () =>
    fieldWrapper(
      <SubBands
        value={subBands}
        labelWidth={LABEL_WIDTH_NEW}
        setValue={setSubBands}
        isMid={isMid()}
        isContinuum={isContinuum()}
        continuumBandwidth={continuumBandwidth}
        continuumBandwidthUnits={continuumBandwidthUnits}
        minimumChannelWidthHz={minimumChannelWidthHz}
      />
    );

  const frequencySetUp = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{observationsBandField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>
          {isContinuum() ? continuumBandwidthField() : bandwidthField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}></Grid>
        <Grid size={{ md: 12, lg: 6 }}>{spectralResolutionField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{spectralAveragingField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{effectiveResolutionField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{isContinuum() ? SubBandsField() : emptyField()}</Grid>
      </>
    );
  };

  const frequencySetUpContinuumSV = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{observationsBandField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{continuumBandwidthField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}></Grid>
      </>
    );
  };

  const frequencySetUpSpectralSV = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{observationsBandField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{spectralAveragingField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{zoomChannelsField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{spectralResolutionField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{effectiveResolutionField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{emptyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{bandwidthField()}</Grid>
      </>
    );
  };

  const frequencySetUpPSTSV = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{observationsBandField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}> {continuumBandwidthField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{pstModeField()}</Grid>
      </>
    );
  };

  const addButtonDisabled = () => {
    // TODO : We need to make this a bit cleverer, but this will do for a short time
    return isEdit() ? false : validateId() ? true : false;
  };

  const pageFooter = () => {
    const buttonClicked = () => {
      isEdit() ? updateObservationOnProposal() : addObservationToProposal();
      if (!loggedIn || osdCyclePolicy.maxObservations !== 1) {
        navigate(NAV[BACK_PAGE]);
      }
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom: FOOTER_HEIGHT_PHT + (loggedIn && osdCyclePolicy.maxObservations === 1 ? 60 : 0),
          left: 0,
          right: loggedIn && osdCyclePolicy.maxObservations === 1 ? 30 : 0
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
            {(!loggedIn || osdCyclePolicy.maxObservations !== 1) && (
              <AddButton
                action={buttonClicked}
                disabled={addButtonDisabled()}
                primary
                testId={isEdit() ? 'updateObservationButtonEntry' : 'addObservationButtonEntry'}
                title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
              />
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <HelpShell page={PAGE}>
      <Box pt={2}>
        {(!loggedIn || osdCyclePolicy.maxObservations > 1) && (
          <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
        )}
        <Grid
          pl={4}
          pr={4}
          container
          direction="row"
          alignItems="space-evenly"
          justifyContent="space-between"
          spacing={1}
        >
          <Grid size={{ md: 12, lg: 9 }}>
            <Grid
              container
              direction="row"
              spacing={2}
              pb={2}
              alignItems="stretch"
              justifyContent="flex-start"
            >
              {!isSV() && (
                <Grid size={{ md: 12, lg: 6 }}>
                  <BorderedSection
                    title={t('observationSections.identifiers')}
                    sx={{ height: '100%' }}
                  >
                    <CardContent>
                      <Grid
                        p={0}
                        container
                        direction="row"
                        alignItems="flex-start"
                        rowSpacing={1}
                        justifyContent="space-between"
                      >
                        <Grid size={{ md: 12 }}>{idField()}</Grid>
                        <Grid size={{ md: 12 }}>{observationTypeField()}</Grid>
                        <Grid size={{ md: 12 }}>{groupObservationsField()}</Grid>
                        <Grid size={{ md: 12 }}>{elevationField()}</Grid>
                        <Grid size={{ md: 12 }}>{isLow() ? emptyField() : weatherField()}</Grid>
                      </Grid>
                    </CardContent>
                  </BorderedSection>
                </Grid>
              )}

              {isSV() && (
                <Grid size={{ md: 6 }}>
                  <BorderedSection
                    title={t('observationSections.identifiers')}
                    sx={{ height: '100%' }}
                  >
                    <Grid
                      container
                      direction="row"
                      alignItems="flex-start"
                      spacing={2}
                      justifyContent="space-between"
                    >
                      <Grid size={{ md: 12 }}>{observationTypeField()}</Grid>
                      <Grid size={{ md: 12 }}></Grid>
                    </Grid>
                  </BorderedSection>
                </Grid>
              )}

              <Grid size={{ md: 6 }}>
                <BorderedSection
                  title={t('observationSections.arraySetUp')}
                  sx={{ height: '100%' }}
                >
                  <Grid
                    p={0}
                    container
                    direction="row"
                    alignItems="flex-start"
                    rowSpacing={isSV() ? 0 : 2}
                  >
                    <Grid size={{ md: 12 }}></Grid>
                    <Grid size={{ md: 12 }}>{subArrayField()}</Grid>
                    <Grid size={{ md: 12 }}>
                      {!isSV() && (isLow() ? numStationsField() : antennasFields())}
                    </Grid>
                    <Grid size={{ md: 12 }}>{suppliedField()}</Grid>
                  </Grid>
                </BorderedSection>
              </Grid>
            </Grid>

            <BorderedSection title={t('observationSections.frequencySetUp')}>
              <Grid
                p={0}
                container
                direction="row"
                alignItems="center"
                columnSpacing={6}
                rowSpacing={1}
                justifyContent="space-between"
              >
                {!isSV() && frequencySetUp()}{' '}
                {/* shows to user some fields that are hidden in mock call */}
                {isSV() && isContinuum() && frequencySetUpContinuumSV()}
                {isSV() && isZoom() && frequencySetUpSpectralSV()}
                {isSV() && isPST() && frequencySetUpPSTSV()}
              </Grid>
            </BorderedSection>
          </Grid>
          {isLowAA2() && ( // TODO : Need to make this generic from OSD Data
            <Grid sx={{ p: { md: 5, lg: 0 } }} size={{ md: 12, lg: 3 }}>
              <Box px={3}>
                <img src={IMAGE_PATH} alt="Low AA2" width="100%" />
              </Box>
            </Grid>
          )}
        </Grid>
        <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
        {pageFooter()}
      </Box>
    </HelpShell>
  );
}
