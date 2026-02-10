import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography } from '@mui/material';
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
  BorderedSection,
  AlertColorTypes
} from '@ska-telescope/ska-gui-components';
import {
  NAV,
  SUPPLIED_VALUE_DEFAULT_MID,
  TYPE_CONTINUUM,
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
  FOOTER_HEIGHT_PHT,
  PAGE_OBSERVATION,
  PAGE_OBSERVATION_UPDATE,
  PAGE_OBSERVATION_ADD,
  FREQUENCY_HZ,
  ZOOM_BANDWIDTH_DEFAULT_LOW,
  TYPE_PST,
  ZOOM_BANDWIDTH_DEFAULT_MID,
  TEL_UNITS,
  BAND_LOW_STR,
  SA_AA2,
  SA_CUSTOM,
  PULSAR_TIMING_VALUE,
  cypressToken
} from '@utils/constants.ts';
import {
  frequencyConversion,
  generateId,
  getBandwidthLowZoom,
  getBandwidthZoom,
  getMinimumChannelWidth,
  obTypeTransform
} from '@utils/helpers.ts';
import WeatherField from '@/components/fields/weather/weather';
import PageBannerPPT from '@/components/layout/pageBannerPPT/PageBannerPPT';
import Proposal from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import GroupObservationsField from '@/components/fields/groupObservations/groupObservations';
import Observation from '@/utils/types/observation';
import SubArrayField from '@/components/fields/subArray/SubArray';
import ObservingBandField from '@/components/fields/observingBand/ObservingBand';
import ObservationTypeField from '@/components/fields/observationType/ObservationType';
import EffectiveResolutionField from '@/components/fields/effectiveResolution/EffectiveResolution';
import ElevationField, { ELEVATION_DEFAULT } from '@/components/fields/elevation/Elevation';
import SpectralAveragingField from '@/components/fields/spectralAveraging/SpectralAveraging';
import SpectralResolutionField from '@/components/fields/spectralResolution/SpectralResolution';
import NumStations from '@/components/fields/numStations/NumStations';
import ContinuumBandwidthField from '@/components/fields/bandwidthFields/continuumBandwidth/continuumBandwidth';
import BandwidthField from '@/components/fields/bandwidthFields/bandwidth/bandwidth';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import {
  calculateCentralFrequency,
  calculateContinuumBandwidth
} from '@/utils/calculate/calculate';
import HelpShell from '@/components/layout/HelpShell/HelpShell';
import PstModeField from '@/components/fields/pstMode/PstMode';
import { useHelp } from '@/utils/help/useHelp';
import SuppliedValue from '@/components/fields/suppliedValue/suppliedValue';
import CentralFrequency from '@/components/fields/centralFrequency/centralFrequency';
import ZoomChannels from '@/components/fields/zoomChannels/zoomChannels';
import SubBands from '@/components/fields/subBands/subBands';
import updateObservations from '@/utils/update/observations/updateObservations';
import updateDataProductsPST from '@/utils/update/dataProductsPST/updateDataProductsPST';
import updateSensCalcPartial from '@/utils/update/sensCalcPartial/updateSensCalcPartial';
import updateSensCalc from '@/utils/update/sensCalc/updateSensCalc';
import { DataProductSDPNew } from '@/utils/types/dataProduct';

const GAP = 5;
const BACK_PAGE = PAGE_OBSERVATION;
const IMAGE_PATH_LOW_AA2 =
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
  const {
    isSV,
    osdLOW,
    osdMID,
    observatoryConstants,
    osdCyclePolicy,
    selectedPolicy,
    telescopeBand
  } = useOSDAccessors();

  const isEdit = () => locationProperties.state !== null || data !== undefined;

  const PAGE = isEdit() ? PAGE_OBSERVATION_UPDATE : PAGE_OBSERVATION_ADD;

  const { application, updateAppContent2 } = storageObject.useStore();
  const { setHelp } = useHelp();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(SA_AA2);
  const [observingBand, setObservingBand] = React.useState(BAND_LOW_STR);
  const [observationType, setObservationType] = React.useState(TYPE_CONTINUUM);
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
  const [numOfStations, setNumOfStations] = React.useState<number | undefined>(0);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [minimumChannelWidthHz, setMinimumChannelWidthHz] = React.useState<number>(0);
  const [zoomChannels, setZoomChannels] = React.useState<number>(0);
  const [pstMode, setPstMode] = React.useState(PULSAR_TIMING_VALUE);
  const [maxZoomChannels, setMaxZoomChannels] = React.useState<number>(0);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [myObsId, setMyObsId] = React.useState('');
  const [once, setOnce] = React.useState<Observation | null>(null);

  const observationIn = (ob: Observation) => {
    setMyObsId(ob?.id);
    setSubarrayConfig(ob?.subarray);
    setObservationType(ob.type);
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
    setSpectralResolution(ob?.spectralResolution ?? '');
    setSpectralAveraging(ob?.spectralAveraging ?? 1);
    setSuppliedType(ob?.supplied.type);
    setSuppliedValue(ob?.supplied.value);
    setSuppliedUnits(ob?.supplied.units);
    setSubBands(ob?.numSubBands ?? 0);
    setNumOf15mAntennas(ob?.num15mAntennas ?? 0);
    setNumOf13mAntennas(ob?.num13mAntennas ?? 0);
    setNumOfStations(ob?.numStations ?? 0);
    setZoomChannels(ob?.zoomChannels ?? 0);
    setPstMode(ob?.pstMode ?? PULSAR_TIMING_VALUE);
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
    const dataProductSDP: DataProductSDPNew | undefined = proposal.dataProductSDP?.find(
      dp => dp.observationId === newObservation.id
    );
    const oldTO = proposal?.targetObservation ?? [];
    const to = dataProductSDP
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
    if ((loggedIn || cypressToken) && (osdCyclePolicy?.maxObservations ?? 1) === 1) {
      isEdit() ? updateObservationOnProposal() : addObservationToProposal();
    }
  };

  const setDefaultCentralFrequency = (inBand: string) => {
    const obsBand = telescopeBand(inBand) === TELESCOPE_LOW_NUM ? osdLOW : osdMID;
    const newUnits = inBand === BAND_LOW_STR ? FREQUENCY_MHZ : FREQUENCY_GHZ;
    const newValueHz = calculateCentralFrequency(obsBand, inBand);
    const newValue = frequencyConversion(newValueHz, FREQUENCY_HZ, newUnits);
    setCentralFrequency(newValue);
    setCentralFrequencyUnits(newUnits);
  };

  const setDefaultContinuumBandwidth = (inBand: string) => {
    if (!isContinuum()) {
      return;
    }
    const newUnits = inBand === BAND_LOW_STR ? FREQUENCY_MHZ : FREQUENCY_GHZ;
    const newArray = telescopeBand(inBand) === TELESCOPE_LOW_NUM ? osdLOW : osdMID;
    const newValue = frequencyConversion(
      calculateContinuumBandwidth(newArray, subarrayConfig),
      FREQUENCY_HZ,
      newUnits
    );
    setContinuumBandwidth(newValue);
    setContinuumBandwidthUnits(newUnits);
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

    setDefaultCentralFrequency(String(e));
    setDefaultContinuumBandwidth(String(e));
    setObservingBand(String(e));
    updateStorageProposal();
  };

  const setTheSubarrayConfig = (e: React.SetStateAction<string>) => {
    const record = observatoryConstants.array[telescope() - 1].subarray.find(
      element => element.value === e
    );
    if (record) {
      if (isLow()) {
        const sArray = osdLOW?.subArrays.find((sub: any) => sub.subArray === subarrayConfig);
        setNumOfStations(sArray?.numberStations ?? undefined);
      }
      if (isMid()) {
        const sArray = osdMID?.subArrays.find((sub: any) => sub.subArray === subarrayConfig);
        setNumOf15mAntennas(sArray?.numberSkaDishes ?? undefined);
        setNumOf13mAntennas(sArray?.numberMeerkatDishes ?? undefined);
      }
    }
    setSubarrayConfig(e);
    updateStorageProposal();
  };

  // TODO : This will need to be a lookup if/when the OSD correctly provides subarrays in an array
  const setMaxChannelsZoom = (_subarrayConfig: string) => {
    const record = isLow() ? osdLOW : osdMID;
    setMaxZoomChannels(0);
    if (record) {
      const sArray = record.subArrays.find((sub: any) => sub.subArray === SA_AA2);
      setMaxZoomChannels(sArray?.numberZoomChannels ?? 0);
    }
  };

  React.useEffect(() => {
    setHelp('observationId');
    if (isEdit()) {
      observationIn(data ? data : locationProperties.state);
      setMaxChannelsZoom(subarrayConfig);
      setOnce(data ? data : locationProperties.state);
    } else {
      const obsBand = telescopeBand(observingBand) === TELESCOPE_LOW_NUM ? osdLOW : osdMID;
      setMyObsId(generateId(t('addObservation.idPrefix'), 6));
      setTheSubarrayConfig(subarrayConfig);
      setMaxChannelsZoom(subarrayConfig);
      setCentralFrequency(
        frequencyConversion(
          calculateCentralFrequency(obsBand, observingBand),
          FREQUENCY_HZ,
          isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
        )
      );
      setCentralFrequencyUnits(isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
      setContinuumBandwidth(
        frequencyConversion(
          calculateContinuumBandwidth(obsBand, subarrayConfig),
          FREQUENCY_HZ,
          isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
        )
      );
      setContinuumBandwidthUnits(isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  }, []);

  const setAfterChange = () => {
    setValidateToggle(!validateToggle);
    setMaxChannelsZoom(subarrayConfig);
  };

  React.useEffect(() => {
    setAfterChange();
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
      setDefaultCentralFrequency(observingBand);
      setDefaultContinuumBandwidth(observingBand);
    }
    const calculateMinimumChannelWidthHz = () =>
      setMinimumChannelWidthHz(getMinimumChannelWidth(telescope()));

    calculateSubarray();
    setAfterChange();
    setFrequencyUnits();
    calculateMinimumChannelWidthHz();
  }, [observingBand]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isZoom = () => observationType === TYPE_ZOOM;
  const isPST = () => observationType === TYPE_PST;
  const isLow = () => observingBand === BAND_LOW_STR;
  const isMid = () => observingBand !== BAND_LOW_STR;
  const telescope = () => (isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM);

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const showWarning = () => {
    let min = 0;
    let max = 0;
    let minResult = 0;
    let maxResult = 0;

    if (isMid()) {
      const receiver = osdMID?.basicCapabilities?.receiverInformation.find(
        e => e.rxId === String(observingBand)
      );
      min = receiver?.minFrequencyHz ?? 0;
      max = receiver?.maxFrequencyHz ?? 0;

      const minFreq = frequencyConversion(
        min,
        FREQUENCY_HZ,
        isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
      );
      const maxFreq = frequencyConversion(
        max,
        FREQUENCY_HZ,
        isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
      );
      const useBandwidth = isContinuum() ? continuumBandwidth : bandwidth;

      minResult = minFreq + useBandwidth / 2;
      maxResult = maxFreq - useBandwidth / 2;
    } else {
      min = osdLOW?.basicCapabilities?.minFrequencyHz ?? 0;
      max = osdLOW?.basicCapabilities?.maxFrequencyHz ?? 0;

      const minFreq = frequencyConversion(
        min,
        FREQUENCY_HZ,
        isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
      );
      const maxFreq = frequencyConversion(
        max,
        FREQUENCY_HZ,
        isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ
      );
      const useBandwidth = isContinuum() ? continuumBandwidth : bandwidth;
      minResult = minFreq + useBandwidth / 2;
      maxResult = maxFreq - useBandwidth / 2;
    }

    return centralFrequency < minResult || centralFrequency > maxResult;
  };

  const emptyField = () => <></>;

  /******************************************************/

  const idField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <TextEntry
          disabled
          errorText={isEdit() ? '' : validateId()}
          label={t('observationId.label')}
          onFocus={() => setHelp('observationId')}
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
        onFocus={() => setHelp('groupObservations')}
        setValue={setGroupObservation}
        value={groupObservation}
        obsId={myObsId}
      />
    );

  const frequencySpectrumField = () => {
    const colors = getColors({
      type: 'telescope',
      colors: isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM,
      content: 'bg',
      dim: 0.6,
      asArray: true,
      paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
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
      <Grid container justifyContent="space-around">
        <Grid size={{ xs: 12 }}>
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
            bandColor={colors[0]}
            boxWidth="100%"
            unit={TEL_UNITS[isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM]}
          />
        </Grid>
        {showWarning() && (
          <Grid>
            <Typography color={AlertColorTypes.Warning}>
              {t('frequencyBandwidthOutOfRange.warning')}
            </Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  const observationsBandField = () =>
    fieldWrapper(
      <ObservingBandField
        disabled={(selectedPolicy?.cyclePolicies?.bands?.length ?? 0) < 2}
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
        telescope={telescope()}
        value={subarrayConfig}
        setValue={setTheSubarrayConfig}
      />
    );

  const pstModeField = () =>
    fieldWrapper(<PstModeField required value={pstMode} setValue={setPstMode} />);

  const numStationsField = () =>
    fieldWrapper(
      <NumStations
        disabled={subarrayConfig !== SA_CUSTOM}
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
          disabled={subarrayConfig !== SA_CUSTOM}
          label={t('numOf15mAntennas.label')}
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
          disabled={subarrayConfig !== SA_CUSTOM}
          label={t('numOf13mAntennas.label')}
          testId="numOf13mAntennas"
          value={numOf13mAntennas}
          setValue={validate}
          onFocus={() => setHelp('numOf13mAntennas')}
        />
      );
    };

    return fieldWrapper(
      <Grid pt={1} container direction="row" spacing={GAP}>
        <Grid size={{ xs: 6 }}>{NumOf15mAntennasField()}</Grid>
        <Grid size={{ xs: 6 }}>{numOf13mAntennasField()}</Grid>
      </Grid>
    );
  };

  const elevationField = () =>
    fieldWrapper(
      <ElevationField
        isLow={isLow()}
        label={t('elevation.label')}
        onFocus={() => setHelp('elevation')}
        setValue={setElevation}
        testId="elevation"
        value={elevation}
      />
    );

  const weatherField = () =>
    fieldWrapper(
      <WeatherField
        disabled={isLow()}
        label={t('weather.label')}
        onFocus={() => setHelp('weather')}
        setValue={setWeather}
        testId="weather"
        value={weather}
      />
    );

  /**************************************************************/

  const low = isLow();

  const obsTypeOptions = React.useMemo(() => {
    if (osdCyclePolicy?.maxTargets === 1 && osdCyclePolicy?.maxObservations === 1) {
      const sc = getProposal().scienceCategory;
      return [
        {
          label: t(`observationType.${sc}`),
          value: sc
        }
      ];
    }
    const obj = low ? osdLOW : osdMID;
    const rec = obj?.subArrays.find(r => r.subArray === subarrayConfig);
    const modes = obTypeTransform(rec?.cbfModes ?? []);
    return modes.map(mode => ({
      label: t(`observationType.${mode}`),
      value: mode
    }));
  }, [subarrayConfig, low, osdLOW, osdMID, t]);

  React.useEffect(() => {
    if (obsTypeOptions.length === 0) return;

    if (!observationType && obsTypeOptions.length > 0) {
      setObservationType(obsTypeOptions[0].value);
      return;
    }

    const isValid = obsTypeOptions.some(opt => opt.value === observationType);
    if (!isValid && obsTypeOptions.length > 0) {
      setObservationType(obsTypeOptions[0].value);
    }
  }, [observationType, obsTypeOptions, setObservationType]);

  const observationTypeField = () =>
    fieldWrapper(
      <ObservationTypeField
        disabled={
          (!isLoggedIn() && !cypressToken) ||
          (osdCyclePolicy?.maxTargets === 1 && osdCyclePolicy?.maxObservations === 1)
        }
        options={obsTypeOptions}
        required
        value={observationType}
        setValue={setObservationType}
      />
    );

  const suppliedTypeField = () => {
    const getOptions = () =>
      isLow() ? [observatoryConstants?.Supplied[0]] : observatoryConstants?.Supplied;
    return (
      <Box pt={2}>
        <DropDown
          options={getOptions()}
          testId="suppliedType"
          value={suppliedType}
          setValue={setSuppliedType}
          disabled={getOptions()?.length < 2}
          label={t('suppliedType.label')}
          onFocus={() => setHelp('suppliedType')}
          required
        />
      </Box>
    );
  };

  const suppliedField = () => {
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

    return (
      <Box pt={2}>
        <SuppliedValue
          value={suppliedValue}
          setValue={setSuppliedValue}
          suffix={suppliedUnitsField()}
          label={suppliedType ? observatoryConstants?.Supplied[suppliedType - 1].label : ''}
          required
        />
      </Box>
    );
  };

  const zoomChannelsField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <ZoomChannels
          maxValue={maxZoomChannels}
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
    <Box pt={1}>
      <BandwidthField
        required
        setValue={setBandwidth}
        value={bandwidth}
        telescope={telescope()}
        observingBand={observingBand}
        centralFrequency={centralFrequency}
        centralFrequencyUnits={centralFrequencyUnits}
        subarrayConfig={subarrayConfig}
        minimumChannelWidthHz={minimumChannelWidthHz}
      />
    </Box>
  );

  const spectralResolutionField = () =>
    fieldWrapper(
      <SpectralResolutionField
        bandWidth={isContinuum() ? continuumBandwidth : bandwidth}
        bandWidthUnits={isContinuum() ? continuumBandwidthUnits : isLow() ? 3 : 2}
        frequency={centralFrequency}
        frequencyUnits={centralFrequencyUnits}
        label={t('spectralResolution.label')}
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
        value={spectralAveraging}
        setValue={setSpectralAveraging}
        subarray={subarrayConfig}
        observationType={observationType}
      />
    );

  const effectiveResolutionField = () =>
    fieldWrapper(
      <EffectiveResolutionField
        label={t('effectiveResolution.label')}
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
        disabled={true}
        value={subBands}
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
        <Grid size={{ md: 12, lg: 6 }}>
          {isContinuum() ? continuumBandwidthField() : bandwidthField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>
          {isPST()
            ? pstModeField()
            : isZoom()
            ? spectralAveragingField()
            : isContinuum()
            ? SubBandsField()
            : emptyField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{isZoom() ? spectralResolutionField() : emptyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{isZoom() ? effectiveResolutionField() : emptyField()}</Grid>
      </>
    );
  };

  const frequencySetUpContinuumSV = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
        <Grid size={{ md: 12, lg: 6 }}>{continuumBandwidthField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{centralFrequencyField()}</Grid>
        <Grid size={{ md: 12, lg: 6 }}>{emptyField()}</Grid>
      </>
    );
  };

  const frequencySetUpSpectralSV = () => {
    return (
      <>
        <Grid size={{ md: 12, lg: 12 }} p={2}>
          {frequencySpectrumField()}
        </Grid>
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
      if ((!loggedIn && !cypressToken) || (osdCyclePolicy?.maxObservations ?? 1) !== 1) {
        navigate(NAV[BACK_PAGE]);
      }
    };

    return (
      <Paper
        sx={{
          bgcolor: 'transparent',
          position: 'fixed',
          bottom:
            FOOTER_HEIGHT_PHT +
            ((loggedIn || cypressToken) && (osdCyclePolicy?.maxObservations ?? 1) === 1 ? 60 : 0),
          left: 0,
          right: (loggedIn || cypressToken) && (osdCyclePolicy?.maxObservations ?? 1) === 1 ? 30 : 0
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
            {((!loggedIn && !cypressToken) || (osdCyclePolicy?.maxObservations ?? 1) !== 1) && (
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
        {((!loggedIn && !cypressToken) || (osdCyclePolicy?.maxObservations ?? 1) > 1) && (
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
                    rowSpacing={isSV ? 0 : 2}
                  >
                    <Grid size={{ md: 12 }}>{observationsBandField()}</Grid>
                    <Grid size={{ md: 12 }}>{subArrayField()}</Grid>
                    <Grid size={{ md: 12 }}>
                      {!isSV && (isLow() ? numStationsField() : antennasFields())}
                    </Grid>
                    <Grid size={{ md: 12 }}>{suppliedTypeField()}</Grid>
                    <Grid size={{ md: 12 }}>{suppliedField()}</Grid>
                  </Grid>
                </BorderedSection>
              </Grid>

              {!isSV && (
                <Grid size={{ md: 12, lg: 6 }}>
                  <BorderedSection
                    title={t('observationSections.identifiers')}
                    sx={{ height: '100%' }}
                  >
                    <Grid
                      p={0}
                      container
                      direction="row"
                      alignItems="flex-start"
                      rowSpacing={isSV ? 0 : 2}
                      justifyContent="space-between"
                    >
                      <Grid size={{ md: 12 }}>{idField()}</Grid>
                      <Grid size={{ md: 12 }}>{observationTypeField()}</Grid>
                      <Grid size={{ md: 12 }}>{groupObservationsField()}</Grid>
                      <Grid size={{ md: 12 }}>{elevationField()}</Grid>
                      <Grid size={{ md: 12 }}>{isLow() ? emptyField() : weatherField()}</Grid>
                    </Grid>
                  </BorderedSection>
                </Grid>
              )}

              {isSV && (
                <Grid size={{ md: 6 }}>
                  <BorderedSection
                    title={t('observationSections.identifiers')}
                    sx={{ height: '100%' }}
                  >
                    <Grid
                      container
                      direction="row"
                      alignItems="flex-start"
                      spacing={isSV ? 0 : 2}
                      justifyContent="space-between"
                    >
                      <Grid size={{ md: 12 }}>{observationTypeField()}</Grid>
                      <Grid size={{ md: 12 }}></Grid>
                    </Grid>
                  </BorderedSection>
                </Grid>
              )}
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
                {!isSV && frequencySetUp()}
                {isSV && isContinuum() && frequencySetUpContinuumSV()}
                {isSV && isZoom() && frequencySetUpSpectralSV()}
                {isSV && isPST() && frequencySetUpPSTSV()}
              </Grid>
            </BorderedSection>
          </Grid>
          {isLow() &&
          subarrayConfig === SA_AA2 && ( // TODO : Need to make this generic from OSD Data or endpoint
              <Grid sx={{ p: { md: 5, lg: 0 } }} size={{ md: 12, lg: 3 }}>
                <Box px={3}>
                  <img src={IMAGE_PATH_LOW_AA2} alt="Low AA2" width="100%" />
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
