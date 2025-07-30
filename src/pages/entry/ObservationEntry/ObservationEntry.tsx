import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid2, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DropDown,
  NumberEntry,
  Spacer,
  SPACER_VERTICAL,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import {
  BANDWIDTH_TELESCOPE,
  CENTRAL_FREQUENCY_MAX,
  CENTRAL_FREQUENCY_MIN,
  IW_BRIGGS,
  LAB_IS_BOLD,
  LAB_POSITION,
  NAV,
  BAND_LOW,
  OBSERVATION,
  STATUS_PARTIAL,
  SUPPLIED_VALUE_DEFAULT_MID,
  TYPE_CONTINUUM,
  BAND_5A,
  BAND_5B,
  BAND_2,
  BAND_1,
  OB_SUBARRAY_AA1,
  OB_SUBARRAY_AA05,
  OB_SUBARRAY_AA4,
  OB_SUBARRAY_AA4_13,
  OB_SUBARRAY_AA4_15,
  OB_SUBARRAY_AA_STAR,
  OB_SUBARRAY_AA_STAR_15,
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
  OB_SUBARRAY_AA_STAR_CORE,
  OB_SUBARRAY_AA2_CORE,
  OB_SUBARRAY_AA4_CORE
} from '@utils/constants.ts';
import {
  frequencyConversion,
  generateId,
  getMinimumChannelWidth,
  getScaledBandwidthOrFrequency
} from '@utils/helpers.ts';
import ObservatoryData from '@utils/types/observatoryData.tsx';
import PageBannerPPT from '../../../components/layout/pageBannerPPT/PageBannerPPT';
import HelpPanel from '../../../components/info/helpPanel/HelpPanel';
import Proposal from '../../../utils/types/proposal';
import AddButton from '../../../components/button/Add/Add';
import ImageWeightingField from '../../../components/fields/imageWeighting/imageWeighting';
import GroupObservationsField from '../../../components/fields/groupObservations/groupObservations';
import Observation from '../../../utils/types/observation';
import TargetObservation from '../../../utils/types/targetObservation';
import SubArrayField from '../../../components/fields/subArray/SubArray';
import ObservingBandField from '../../../components/fields/observingBand/ObservingBand';
import ObservationTypeField from '../../../components/fields/observationType/ObservationType';
import EffectiveResolutionField from '../../../components/fields/effectiveResolution/EffectiveResolution';
import ElevationField, { ELEVATION_DEFAULT } from '../../../components/fields/elevation/Elevation';
import RobustField from '../../../components/fields/robust/Robust';
import SpectralAveragingField from '../../../components/fields/spectralAveraging/SpectralAveraging';
import SpectralResolutionField from '../../../components/fields/spectralResolution/SpectralResolution';
import NumStations from '../../../components/fields/numStations/NumStations';
import ContinuumBandwidthField from '../../../components/fields/bandwidthFields/continuumBandwidth/continuumBandwidth';
import BandwidthField from '../../../components/fields/bandwidthFields/bandwidth/bandwidth';

const TOP_LABEL_WIDTH = 6;
const BOTTOM_LABEL_WIDTH = 6;

const BACK_PAGE = 5;
const WRAPPER_WIDTH_BUTTON = 2;

const HELP_PANEL_HEIGHT = '50vh';

export default function ObservationEntry() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const isEdit = () => locationProperties.state !== null;

  const PAGE = isEdit() ? 14 : 10;

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(8);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(1);
  const [effectiveResolution, setEffectiveResolution] = React.useState('');
  const [elevation, setElevation] = React.useState(ELEVATION_DEFAULT[TELESCOPE_LOW_NUM - 1]);
  const [weather, setWeather] = React.useState(Number(t('weather.default')));
  const [centralFrequency, setCentralFrequency] = React.useState(0);
  const [centralFrequencyUnits, setCentralFrequencyUnits] = React.useState(FREQUENCY_MHZ);
  const [imageWeighting, setImageWeighting] = React.useState(1);
  const [tapering, setTapering] = React.useState(0);
  const [bandwidth, setBandwidth] = React.useState(1);
  const [robust, setRobust] = React.useState(3);
  const [spectralAveraging, setSpectralAveraging] = React.useState(1);
  const [spectralResolution, setSpectralResolution] = React.useState('');
  const [suppliedType, setSuppliedType] = React.useState(1);
  const [suppliedValue, setSuppliedValue] = React.useState(SUPPLIED_VALUE_DEFAULT_LOW);
  const [suppliedUnits, setSuppliedUnits] = React.useState(SUPPLIED_INTEGRATION_TIME_UNITS_H);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState(0);
  const [continuumBandwidthUnits, setContinuumBandwidthUnits] = React.useState(2);
  const [subBands, setSubBands] = React.useState(1);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState(4);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState(0);
  const [numOfStations, setNumOfStations] = React.useState(512);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [minimumChannelWidthHz, setMinimumChannelWidthHz] = React.useState<number>(0);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [myObsId, setMyObsId] = React.useState('');
  const [ob, setOb] = React.useState<Observation | null>(null);
  const isAA2 = (subarrayConfig: number) => subarrayConfig === 3;

  const lookupArrayValue = (arr: any[], inValue: string | number) =>
    arr.find(e => e.lookup.toString() === inValue.toString())?.value;

  const observationIn = (ob: Observation) => {
    setOb(ob);
    setMyObsId(ob?.id);
    setSubarrayConfig(ob?.subarray);
    setObservationType(ob?.type);
    setObservingBand(ob?.observingBand);
    setWeather(ob?.weather ?? Number(t('weather.default')));
    setElevation(ob?.elevation);
    setCentralFrequency(ob?.centralFrequency);
    setCentralFrequencyUnits(ob?.centralFrequencyUnits);
    setBandwidth(ob?.bandwidth ?? 0);
    setContinuumBandwidth(ob?.continuumBandwidth ?? 0);
    setContinuumBandwidthUnits(ob?.continuumBandwidthUnits ?? 0);
    setRobust(ob?.robust);
    setSpectralAveraging(ob?.spectralAveraging ?? 1);
    setTapering(ob?.tapering ?? 0);
    setImageWeighting(ob?.imageWeighting);
    setSuppliedType(ob?.supplied.type);
    setSuppliedValue(ob?.supplied.value);
    setSuppliedUnits(ob?.supplied.units);
    setSubBands(ob?.numSubBands ?? 0);
    setNumOf15mAntennas(ob?.num15mAntennas ?? 0);
    setNumOf13mAntennas(ob?.num13mAntennas ?? 0);
    setNumOfStations(ob?.numStations ?? 0);
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
      robust,
      spectralAveraging: spectralAveraging,
      tapering: tapering,
      imageWeighting: imageWeighting,
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
      numStations: numOfStations
    };
    return newObservation;
  };

  const getDefaultSubArrayConfig = (inBand: number, inSubArray: number) => {
    if (inBand === BAND_LOW) {
      if (
        inSubArray === OB_SUBARRAY_AA4_15 ||
        inSubArray === OB_SUBARRAY_AA_STAR_15 ||
        inSubArray === OB_SUBARRAY_AA4_13
      ) {
        return OB_SUBARRAY_AA4;
      }
    } else if (inBand === BAND_5A || inBand === BAND_5B) {
      if (
        inSubArray === OB_SUBARRAY_AA2_CORE ||
        inSubArray === OB_SUBARRAY_AA_STAR ||
        inSubArray === OB_SUBARRAY_AA_STAR_CORE ||
        inSubArray === OB_SUBARRAY_AA4 ||
        inSubArray === OB_SUBARRAY_AA4_CORE
      ) {
        return OB_SUBARRAY_AA4_15;
      }
    } else if (inBand === BAND_1 || inBand === BAND_2) {
      if (
        inSubArray === OB_SUBARRAY_AA2_CORE ||
        inSubArray === OB_SUBARRAY_AA_STAR_CORE ||
        inSubArray === OB_SUBARRAY_AA4_CORE
      ) {
        return OB_SUBARRAY_AA4;
      }
    }
    return inSubArray;
  };

  // Change the central frequency & units only if they are currently the same as the existing defaults
  const setDefaultCentralFrequency = (inBand: number, inSubArray: number) => {
    if (
      Number(centralFrequency) === calculateCentralFrequency(observingBand, subarrayConfig) &&
      centralFrequencyUnits === (isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ)
    ) {
      setCentralFrequency(
        calculateCentralFrequency(inBand, getDefaultSubArrayConfig(inBand, inSubArray))
      );
      setCentralFrequencyUnits(inBand === BAND_LOW ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  };

  // Change the continuum bandwidth & units only if they are currently the same as the existing defaults
  const setDefaultContinuumBandwidth = (inBand: number, inSubArray: number) => {
    if (
      isContinuum() &&
      Number(continuumBandwidth) === calculateContinuumBandwidth(observingBand, subarrayConfig) &&
      continuumBandwidthUnits === (isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ)
    ) {
      setContinuumBandwidth(
        calculateContinuumBandwidth(inBand, getDefaultSubArrayConfig(inBand, inSubArray))
      );
      setContinuumBandwidthUnits(inBand === BAND_LOW ? FREQUENCY_MHZ : FREQUENCY_GHZ);
    }
  };

  const setDefaultElevation = (inBand: number) => {
    if (elevation === ELEVATION_DEFAULT[(isLow() ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM) - 1]) {
      setElevation(ELEVATION_DEFAULT[telescope(inBand) - 1]);
    }
  };

  const validateId = () =>
    getProposal()?.observations?.find(t => t.id === myObsId) ? t('observationId.notUnique') : '';

  const setTheObservingBand = (e: React.SetStateAction<number>) => {
    if (isLow() && e !== 0) {
      setDefaultElevation(e as number);
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_S);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_MID);
    }
    if (!isLow() && e === 0) {
      setDefaultElevation(e);
      setSuppliedType(1); // TODO : Replace with constant
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_H);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_LOW);
    }

    setDefaultCentralFrequency(e as number, subarrayConfig);
    setDefaultContinuumBandwidth(e as number, subarrayConfig);
    setObservingBand(e);
  };

  const setTheSubarrayConfig = (e: React.SetStateAction<number>) => {
    const record = OBSERVATION.array[telescope() - 1].subarray.find(element => element.value === e);
    if (record) {
      const data: ObservatoryData = application.content3 as ObservatoryData;
      //Set value using OSD Data if Low AA2
      if (isLow() && isAA2(record.value)) {
        setNumOfStations(data?.capabilities?.low?.AA2?.numberStations);
      } else {
        setNumOfStations(record.numOfStations);
      }
      //Set value using OSD Data if Mid AA2
      if (!isLow() && isAA2(record.value)) {
        setNumOf15mAntennas(data?.capabilities?.mid?.AA2?.numberSkaDishes);
      } else {
        setNumOf15mAntennas(record.numOf15mAntennas);
      }
    }
    setNumOf13mAntennas(record.numOf13mAntennas);
    setDefaultCentralFrequency(observingBand, e as number);
    setDefaultContinuumBandwidth(observingBand, e as number);
    setSubarrayConfig(e);
  };

  React.useEffect(() => {
    helpComponent(t('observationId.help'));
    if (isEdit()) {
      observationIn(locationProperties.state);
    } else {
      setMyObsId(generateId(t('addObservation.idPrefix'), 6));
      setCentralFrequency(calculateCentralFrequency(observingBand, subarrayConfig));
      setCentralFrequencyUnits(isLow() ? FREQUENCY_MHZ : FREQUENCY_GHZ);
      setContinuumBandwidth(calculateContinuumBandwidth(observingBand, subarrayConfig));
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
    setValidateToggle(!validateToggle);
  }, [
    groupObservation,
    elevation,
    weather,
    imageWeighting,
    tapering,
    robust,
    suppliedType,
    suppliedValue,
    suppliedUnits,
    centralFrequencyUnits,
    continuumBandwidth,
    subBands,
    numOf15mAntennas,
    numOf13mAntennas,
    numOfStations
  ]);

  const calculateCentralFrequency = (obsBand: number, subarrayConfig: number) => {
    switch (obsBand) {
      case BAND_1:
        return lookupArrayValue(OBSERVATION.CentralFrequencyOB1, subarrayConfig);
      case BAND_2:
        return lookupArrayValue(OBSERVATION.CentralFrequencyOB2, subarrayConfig);
      case BAND_5A:
        return OBSERVATION.CentralFrequencyOB5a[0].value;
      case BAND_5B:
        return OBSERVATION.CentralFrequencyOB5b[0].value;
      default:
        return OBSERVATION.CentralFrequencyOBLow[0].value;
    }
  };

  const calculateContinuumBandwidth = (ob: number, sc: number) => {
    switch (ob) {
      case BAND_1:
        return lookupArrayValue(OBSERVATION.ContinuumBandwidthOB1, sc);
      case BAND_2:
        return lookupArrayValue(OBSERVATION.ContinuumBandwidthOB2, sc);
      case BAND_5A:
        return lookupArrayValue(OBSERVATION.ContinuumBandwidthOB5a, sc);
      case BAND_5B:
        return lookupArrayValue(OBSERVATION.ContinuumBandwidthOB5b, sc);
      default:
        return lookupArrayValue(OBSERVATION.ContinuumBandwidthOBLow, sc);
    }
  };

  React.useEffect(() => {
    const calculateSubarray = () => {
      if (isEdit()) {
        return;
      }
      setSubarrayConfig(getDefaultSubArrayConfig(observingBand, subarrayConfig));
    };

    const setFrequencyUnits = () => {
      if (isLow()) {
        setCentralFrequencyUnits(FREQUENCY_MHZ);
      }
    };

    if (ob) {
      // We just need to do this one more time as some fields could not be updated until observingBand has changed.
      observationIn(ob);
      setOb(null);
    }
    const calculateMinimumChannelWidthHz = () =>
      setMinimumChannelWidthHz(getMinimumChannelWidth(telescope()));

    calculateSubarray();
    setFrequencyUnits();
    calculateMinimumChannelWidthHz();
  }, [observingBand]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW;
  const telescope = (band = observingBand) => BANDWIDTH_TELESCOPE[band]?.telescope;

  const isContinuumOnly = () =>
    subarrayConfig === OB_SUBARRAY_AA05 ||
    subarrayConfig === OB_SUBARRAY_AA1 ||
    (observingBand !== 0 && subarrayConfig === OB_SUBARRAY_AA2);

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const suppliedWrapper = (children: React.JSX.Element) => (
    <Box p={0} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const emptyField = () => <></>;

  /******************************************************/

  const taperingField = () => {
    const frequencyInGHz = () => {
      return frequencyConversion(centralFrequency, centralFrequencyUnits, FREQUENCY_GHZ);
    };

    const getOptions = () => {
      const results = [{ label: t('tapering.0'), value: 0 }];
      [0.25, 1, 4, 16, 64, 256, 1024].forEach(inValue => {
        const theLabel = (inValue * (1.4 / frequencyInGHz())).toFixed(3) + '"';
        results.push({ label: theLabel, value: inValue });
      });
      return results;
    };

    return fieldDropdown(
      false,
      'tapering',
      BOTTOM_LABEL_WIDTH,
      getOptions(),
      true,
      setTapering,
      null,
      tapering
    );
  };

  const idField = () => {
    return fieldWrapper(
      <Box pt={1}>
        <TextEntry
          disabled={isEdit()}
          errorText={isEdit() ? '' : validateId()}
          label={t('observationId.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={TOP_LABEL_WIDTH}
          onFocus={() => helpComponent(t('observationId.help'))}
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
        labelWidth={TOP_LABEL_WIDTH}
        onFocus={() => helpComponent(t('groupObservations.help'))}
        setValue={setGroupObservation}
        value={groupObservation}
        obsId={myObsId}
      />
    );

  const observationsBandField = () =>
    fieldWrapper(
      <ObservingBandField
        widthLabel={TOP_LABEL_WIDTH}
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
        widthLabel={TOP_LABEL_WIDTH}
        telescope={telescope()}
        value={subarrayConfig}
        setValue={setTheSubarrayConfig}
      />
    );

  const numStationsField = () =>
    fieldWrapper(
      <NumStations
        disabled={subarrayConfig !== OB_SUBARRAY_CUSTOM}
        widthLabel={TOP_LABEL_WIDTH}
        setValue={setNumOfStations}
        value={numOfStations}
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
        <Box pt={1}>
          <NumberEntry
            disabled={subarrayConfig !== 20}
            label={t('numOf15mAntennas.short')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={BOTTOM_LABEL_WIDTH}
            testId="numOf15mAntennas"
            value={numOf15mAntennas}
            setValue={validate}
            onFocus={() => helpComponent(t('numOf15mAntennas.help'))}
          />
        </Box>
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
        <Box pt={1}>
          <NumberEntry
            disabled={subarrayConfig !== 20}
            label={t('numOf13mAntennas.short')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={BOTTOM_LABEL_WIDTH}
            testId="numOf13mAntennas"
            value={numOf13mAntennas}
            setValue={validate}
            onFocus={() => helpComponent(t('numOf13mAntennas.help'))}
          />
        </Box>
      );
    };

    return fieldWrapper(
      <Grid2 container direction="row">
        <Grid2 pt={1} size={{ xs: TOP_LABEL_WIDTH }}>
          <InputLabel disabled={subarrayConfig !== 20} shrink={false} htmlFor="numOf15mAntennas">
            <Typography
              sx={{ fontWeight: subarrayConfig === OB_SUBARRAY_CUSTOM ? 'bold' : 'normal' }}
            >
              {t('numOfAntennas.label')}
            </Typography>
          </InputLabel>
        </Grid2>
        <Grid2 size={{ xs: 3 }}>{NumOf15mAntennasField()}</Grid2>
        <Grid2 size={{ xs: 3 }}>{numOf13mAntennasField()}</Grid2>
      </Grid2>
    );
  };

  const elevationField = () =>
    fieldWrapper(
      <ElevationField
        isLow={isLow()}
        label={t('elevation.label')}
        widthLabel={TOP_LABEL_WIDTH}
        onFocus={() => helpComponent(t('elevation.help'))}
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
          onFocus={() => helpComponent(t('weather.help'))}
          suffix={weatherUnitsField()}
        />
      </Box>
    );
  };

  /**************************************************************/

  const observationTypeField = () =>
    fieldWrapper(
      <ObservationTypeField
        disabled={isContinuumOnly()}
        isContinuumOnly={isContinuumOnly()}
        widthLabel={BOTTOM_LABEL_WIDTH}
        required
        value={observationType}
        setValue={setObservationType}
      />
    );

  const suppliedField = () => {
    const suppliedTypeField = () => {
      const getOptions = () => (isLow() ? [OBSERVATION?.Supplied[0]] : OBSERVATION?.Supplied);

      return (
        <Box pt={1}>
          <DropDown
            options={getOptions()}
            testId="suppliedType"
            value={suppliedType}
            setValue={setSuppliedType}
            disabled={getOptions()?.length < 2}
            label=""
            onFocus={() => helpComponent(t('suppliedType.help'))}
            required
          />
        </Box>
      );
    };

    const suppliedUnitsField = () => {
      const getOptions = () => {
        return suppliedType && suppliedType > 0 ? OBSERVATION.Supplied[suppliedType - 1].units : [];
      };

      return (
        <DropDown
          options={getOptions()}
          testId="suppliedUnits"
          value={suppliedUnits}
          disabled={isLow()}
          setValue={setSuppliedUnits}
          label=""
          onFocus={() => helpComponent(t('suppliedUnits.help'))}
        />
      );
    };

    const suppliedValueField = () => {
      const errorMessage = () => {
        return suppliedValue <= 0 ? t('suppliedValue.range.error') : '';
      };
      return (
        <NumberEntry
          errorText={errorMessage()}
          label=""
          testId="suppliedValue"
          value={suppliedValue}
          setValue={setSuppliedValue}
          onFocus={() => helpComponent(t('suppliedValue.help'))}
          suffix={suppliedUnitsField()}
          required
        />
      );
    };

    return suppliedWrapper(
      <Grid2 pt={0} m={0} container>
        <Grid2 pt={1} pr={1} size={{ md: BOTTOM_LABEL_WIDTH }}>
          {suppliedTypeField()}
        </Grid2>
        <Grid2 pt={0} size={{ md: 12 - BOTTOM_LABEL_WIDTH }}>
          {suppliedValueField()}
        </Grid2>
      </Grid2>
    );
  };

  const centralFrequencyField = () => {
    const errorMessage = () =>
      Number(centralFrequency) < CENTRAL_FREQUENCY_MIN[observingBand] ||
      Number(centralFrequency) > CENTRAL_FREQUENCY_MAX[observingBand]
        ? t('centralFrequency.range.error')
        : '';

    return fieldWrapper(
      <Box pt={1}>
        <NumberEntry
          label={t('centralFrequency.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={BOTTOM_LABEL_WIDTH}
          testId="centralFrequency"
          value={centralFrequency}
          setValue={setCentralFrequency}
          onFocus={() => helpComponent(t('centralFrequency.help'))}
          required
          suffix={centralFrequencyUnitsField()}
          errorText={errorMessage()}
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
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      );
    };
    return fieldWrapper(
      <ContinuumBandwidthField
        labelWidth={BOTTOM_LABEL_WIDTH}
        onFocus={() => helpComponent(t(`bandwidth.help.${TYPE_CONTINUUM}`))}
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
    <Grid2>
      {fieldWrapper(
        <BandwidthField
          onFocus={() => helpComponent(t(`bandwidth.help.${TYPE_ZOOM}`))}
          required
          setValue={setBandwidth}
          testId="bandwidth"
          value={bandwidth}
          telescope={telescope()}
          widthLabel={BOTTOM_LABEL_WIDTH}
          observingBand={observingBand}
          centralFrequency={centralFrequency}
          centralFrequencyUnits={centralFrequencyUnits}
          subarrayConfig={subarrayConfig}
          setScaledBandwidth={setScaledBandwidth}
          minimumChannelWidthHz={minimumChannelWidthHz}
        />
      )}
    </Grid2>
  );

  const spectralResolutionField = () =>
    fieldWrapper(
      <SpectralResolutionField
        bandWidth={isContinuum() ? continuumBandwidth : bandwidth}
        bandWidthUnits={isContinuum() ? continuumBandwidthUnits : isLow() ? 3 : 2}
        frequency={centralFrequency}
        frequencyUnits={centralFrequencyUnits}
        label={t('spectralResolution.label')}
        labelWidth={BOTTOM_LABEL_WIDTH}
        observingBand={observingBand}
        observationType={observationType}
        onFocus={() => helpComponent(t('spectralResolution.help'))}
        setValue={setSpectralResolution}
      />
    );

  const spectralAveragingField = () =>
    fieldWrapper(
      <SpectralAveragingField
        isLow={isLow()}
        widthLabel={BOTTOM_LABEL_WIDTH}
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
        labelWidth={BOTTOM_LABEL_WIDTH}
        frequency={centralFrequency}
        frequencyUnits={centralFrequencyUnits}
        spectralAveraging={spectralAveraging}
        spectralResolution={spectralResolution}
        observingBand={observingBand}
        observationType={observationType}
        onFocus={() => helpComponent(t('effectiveResolution.help'))}
        setValue={setEffectiveResolution}
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        labelWidth={BOTTOM_LABEL_WIDTH}
        onFocus={() => helpComponent(t('imageWeighting.help'))}
        setValue={setImageWeighting}
        value={imageWeighting}
      />
    );

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        onFocus={() => helpComponent(t('robust.help'))}
        setValue={setRobust}
        testId="robust"
        value={robust}
        widthButton={WRAPPER_WIDTH_BUTTON}
        widthLabel={BOTTOM_LABEL_WIDTH}
      />
    );

  const fieldDropdown = (
    disabled: boolean,
    field: string,
    labelWidth: number,
    options: { label: string; value: string | number }[],
    required: boolean,
    setValue: Function,
    suffix: any,
    value: string | number
  ) => {
    return fieldWrapper(
      <Grid2 pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid2 pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - WRAPPER_WIDTH_BUTTON : 12 }}>
          <DropDown
            disabled={disabled}
            options={options}
            testId={field}
            value={value}
            setValue={setValue}
            label={t(field + '.label')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={suffix ? labelWidth + 1 : labelWidth}
            onFocus={() => helpComponent(t(field + '.help'))}
            required={required}
          />
        </Grid2>
        <Grid2 size={{ xs: suffix ? WRAPPER_WIDTH_BUTTON : 0 }}>{suffix}</Grid2>
      </Grid2>
    );
  };

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
        onFocus={() => helpComponent(t('frequencyUnits.help'))}
      />
    );
  };

  const SubBandsField = () => {
    const errorMessage = () => {
      const min = Number(t('subBands.range.lower'));
      const max = Number(t('subBands.range.upper'));
      if (subBands < min || subBands > max) {
        return t('subBands.range.error');
      }
      // The sub-band bandwidth defined by the bandwidth of the observation divided by the number of
      // sub-bands should be greater than the minimum allowed bandwidth
      if (!isLow() && isContinuum()) {
        const scaledBandwidth = getScaledBandwidthOrFrequency(
          continuumBandwidth,
          continuumBandwidthUnits
        );
        if (
          scaledBandwidth !== 0 &&
          subBands &&
          scaledBandwidth / subBands < minimumChannelWidthHz
        ) {
          return t('subBands.range.bandwidthSubBand');
        }
      }
      return '';
    };

    const validate = (e: number) => {
      setSubBands(Number(Math.abs(e).toFixed(0)));
    };

    return fieldWrapper(
      <Box pt={1}>
        <NumberEntry
          errorText={errorMessage()}
          label={t('subBands.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={BOTTOM_LABEL_WIDTH}
          testId="subBands"
          value={subBands}
          setValue={validate}
          onFocus={() => helpComponent(t('subBands.help'))}
          required
        />
      </Box>
    );
  };

  const addButtonDisabled = () => {
    // TODO : We need to make this a bit cleverer, but this will do for a short time
    return isEdit() ? false : validateId() ? true : false;
  };

  const pageFooter = () => {
    const addObservationToProposal = () => {
      const newObservation: Observation = observationOut();
      setProposal({
        ...getProposal(),
        observations: [...(getProposal().observations ?? []), newObservation]
      });
    };

    const updateObservationOnProposal = () => {
      const newObservation: Observation = observationOut();

      const oldObservations = getProposal().observations;
      const newObservations: Observation[] = [];
      if (oldObservations && oldObservations?.length > 0) {
        oldObservations.forEach(inValue => {
          newObservations.push(inValue.id === newObservation.id ? newObservation : inValue);
        });
      } else {
        newObservations.push(newObservation);
      }

      const updateSensCalcPartial = (ob: Observation) => {
        const result = getProposal()?.targetObservation?.map(rec => {
          if (rec.observationId === ob.id) {
            const to: TargetObservation = {
              observationId: rec.observationId,
              targetId: rec.targetId,
              sensCalc: {
                id: rec.targetId,
                title: '',
                statusGUI: STATUS_PARTIAL,
                error: ''
              }
            };
            return to;
          } else {
            return rec;
          }
        });
        return result;
      };

      setProposal({
        ...getProposal(),
        observations: newObservations,
        targetObservation: updateSensCalcPartial(newObservation)
      });

      /*
      getAffected(newObservation.id).map(rec => {
        const target = getProposal().targets.find(t => t.id === rec.targetId);
        getSensCalcData(newObservation, target);
      });
      */
    };

    const buttonClicked = () => {
      isEdit() ? updateObservationOnProposal() : addObservationToProposal();
      navigate(NAV[5]);
    };

    return (
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid2
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid2 />
          <Grid2 />
          <Grid2>
            <AddButton
              action={buttonClicked}
              disabled={addButtonDisabled()}
              primary
              testId={isEdit() ? 'updateObservationButtonEntry' : 'addObservationButtonEntry'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid2>
        </Grid2>
      </Paper>
    );
  };

  return (
    <>
      <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
      <Grid2
        pl={4}
        pr={4}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid2 size={{ md: 12, lg: 9 }}>
          <Grid2
            p={0}
            pl={2}
            container
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent="space-around"
          >
            <Grid2 size={{ md: 12, lg: 5 }}>{idField()}</Grid2>
            <Grid2 size={{ lg: 5 }}></Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{groupObservationsField()}</Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{isLow() ? emptyField() : weatherField()}</Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{observationsBandField()}</Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{elevationField()}</Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>{subArrayField()}</Grid2>
            <Grid2 size={{ md: 12, lg: 5 }}>
              {isLow() ? numStationsField() : antennasFields()}
            </Grid2>
          </Grid2>
          <Card variant="outlined">
            <CardContent>
              <Grid2
                p={0}
                container
                direction="row"
                alignItems="center"
                spacing={1}
                justifyContent="space-around"
              >
                <Grid2 size={{ md: 12, lg: 5 }}>{observationTypeField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{suppliedField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}> {centralFrequencyField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>
                  {isContinuum() ? continuumBandwidthField() : bandwidthField()}
                </Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{spectralResolutionField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{spectralAveragingField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{effectiveResolutionField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>
                  {isContinuum() ? SubBandsField() : emptyField()}
                </Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{imageWeightingField()}</Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>
                  {imageWeighting === IW_BRIGGS ? robustField() : emptyField()}
                </Grid2>
                <Grid2 size={{ md: 12, lg: 5 }}>{isLow() ? emptyField() : taperingField()}</Grid2>
                <Grid2 size={{ lg: 5 }}>{isLow() ? <></> : emptyField()}</Grid2>
              </Grid2>
            </CardContent>
          </Card>
        </Grid2>
        <Grid2 size={{ md: 12, lg: 3 }}>
          <Box pl={4}>
            <HelpPanel minHeight={HELP_PANEL_HEIGHT} maxHeight={HELP_PANEL_HEIGHT} />
          </Box>
        </Grid2>
      </Grid2>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {pageFooter()}
    </>
  );
}
