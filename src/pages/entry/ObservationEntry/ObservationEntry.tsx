import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../../components/layout/pageBanner/PageBanner';
import {
  BANDWIDTH_TELESCOPE,
  CENTRAL_FREQUENCY_MAX,
  CENTRAL_FREQUENCY_MIN,
  ELEVATION_DEFAULT,
  ELEVATION_MAX,
  ELEVATION_MIN,
  ELEVATION_UNITS,
  IW_BRIGGS,
  LAB_IS_BOLD,
  LAB_POSITION,
  MULTIPLIER_HZ_GHZ,
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
  OB_SUBARRAY_AA2,
  OB_SUBARRAY_AA05,
  OB_SUBARRAY_AA4,
  OB_SUBARRAY_AA4_13,
  OB_SUBARRAY_AA4_15,
  OB_SUBARRAY_AA_STAR,
  OB_SUBARRAY_AA_STAR_15,
  OB_SUBARRAY_CUSTOM,
  ROBUST,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_INTEGRATION_TIME_UNITS_S,
  SUPPLIED_VALUE_DEFAULT_LOW
} from '../../../utils/constants';
import HelpPanel from '../../../components/info/helpPanel/helpPanel';
import Proposal from '../../../utils/types/proposal';
import { generateId } from '../../../utils/helpers';
import AddButton from '../../../components/button/Add/Add';
import ImageWeightingField from '../../../components/fields/imageWeighting/imageWeighting';
import GroupObservationsField from '../../../components/fields/groupObservations/groupObservations';
import Observation from '../../../utils/types/observation';
import TargetObservation from '../../../utils/types/targetObservation';
import SubArrayField from '../../../components/fields/subArray/SubArray';
import ObservingBandField from '../../../components/fields/observingBand/ObservingBand';
import ObservationTypeField from '../../../components/fields/observationType/ObservationType';
import SpectralAveragingField from '../../../components/fields/spectralAveraging/SpectralAveraging';
import NumStations from '../../../components/fields/numStations/NumStations';
import { roundSpectralResolution } from '../../../utils/present';

const XS_TOP = 5;
const XS_BOTTOM = 5;
const BACK_PAGE = 5;

const LABEL_WIDTH_SELECT = 6;
const LABEL_WIDTH_OPT1 = 6;
const FIELD_WIDTH_BUTTON = 2;

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
  const [elevation, setElevation] = React.useState(ELEVATION_DEFAULT);
  const [weather, setWeather] = React.useState(Number(t('weather.default')));
  const [centralFrequency, setCentralFrequency] = React.useState(0);
  const [centralFrequencyUnits, setCentralFrequencyUnits] = React.useState(1);
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
  const [continuumBandwidthUnits, setContinuumBandwidthUnits] = React.useState(1);
  const [subBands, setSubBands] = React.useState(1);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState(4);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState(0);
  const [numOfStations, setNumOfStations] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [calculateToggle, setCalculateToggle] = React.useState(false);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [myObsId, setMyObsId] = React.useState('');

  const lookupArrayValue = (arr: any[], inValue: string | number) =>
    arr.find(e => e.lookup.toString() === inValue.toString())?.value;

  const observationIn = (ob: Observation) => {
    setMyObsId(ob?.id);
    setSubarrayConfig(ob?.subarray);
    setObservationType(ob?.type);
    setObservingBand(ob?.observingBand);
    setWeather(ob?.weather);
    setElevation(ob?.elevation);
    setCentralFrequency(ob?.centralFrequency);
    setCentralFrequencyUnits(ob?.centralFrequencyUnits);
    setBandwidth(ob?.bandwidth);
    setContinuumBandwidth(ob?.continuumBandwidth);
    setContinuumBandwidthUnits(ob?.continuumBandwidthUnits);
    setRobust(ob?.robust);
    setSpectralAveraging(ob?.spectralAveraging);
    setTapering(ob?.tapering);
    setImageWeighting(ob?.imageWeighting);
    setSuppliedType(ob?.supplied.type);
    setSuppliedValue(ob?.supplied.value);
    setSuppliedUnits(ob?.supplied.units);
    setSubBands(ob?.numSubBands);
    setNumOf15mAntennas(ob?.num15mAntennas);
    setNumOf13mAntennas(ob?.num13mAntennas);
    setNumOfStations(ob?.numStations);
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
      elevation: elevation, // TODO: add min_elevation field and use it for LOW // TODO modify elevation format and create elevation type to capture info needed for ElevationBackend type and update sens calc mapping
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

  const setTheObservingBand = (e: React.SetStateAction<number>) => {
    if (isLow() && e !== 0) {
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_S);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_MID);
    }
    if (!isLow() && e === 0) {
      setSuppliedType(1);
      setSuppliedUnits(SUPPLIED_INTEGRATION_TIME_UNITS_H);
      setSuppliedValue(SUPPLIED_VALUE_DEFAULT_LOW);
    }
    if (centralFrequency === calculateCentralFrequency(observingBand, subarrayConfig)) {
      setCentralFrequency(calculateCentralFrequency(e as number, subarrayConfig));
    }
    setObservingBand(e);
    calculateContinuumBandwidth(e as number, subarrayConfig);
  };

  const setTheSubarrayConfig = (e: React.SetStateAction<number>) => {
    const record = OBSERVATION.array[telescope() - 1].subarray.find(element => element.value === e);
    if (record && record.value !== OB_SUBARRAY_CUSTOM) {
      setNumOf15mAntennas(record.numOf15mAntennas);
      setNumOf13mAntennas(record.numOf13mAntennas);
      setNumOfStations(record.numOfStations);
    }
    if (centralFrequency === calculateCentralFrequency(observingBand, subarrayConfig)) {
      setCentralFrequency(calculateCentralFrequency(observingBand, e as number));
    }
    setSubarrayConfig(e);
    calculateContinuumBandwidth(observingBand, e as number);
  };

  React.useEffect(() => {
    helpComponent(t('observingBand.help'));
    if (isEdit()) {
      observationIn(locationProperties.state);
    } else {
      setMyObsId(generateId(t('addObservation.idPrefix'), 6));
      setCentralFrequency(calculateCentralFrequency(observingBand, subarrayConfig));
      calculateContinuumBandwidth(observingBand, subarrayConfig);
    }
    setCalculateToggle(!calculateToggle);
  }, []);

  React.useEffect(() => {
    const calculateSpectralResolution = () => {
      const getSpectralResolution = (inLabel: String, inValue: number | string) => {
        if (isContinuum()) {
          return lookupArrayValue(OBSERVATION[inLabel], inValue);
        } else {
          return OBSERVATION[inLabel].find(
            e =>
              e.lookup.toString() === inValue.toString() &&
              e.bandWidthValue?.toString() === bandwidth?.toString()
          )?.value;
        }
      };

      switch (observingBand) {
        case BAND_1:
          return getSpectralResolution(
            isContinuum() ? 'SpectralResolutionOb1' : 'SpectralResolutionOb1Zoom',
            centralFrequency
          );
        case BAND_2:
          return getSpectralResolution(
            isContinuum() ? 'SpectralResolutionOb2' : 'SpectralResolutionOb2Zoom',
            centralFrequency
          );
        case BAND_5A:
          return isContinuum()
            ? OBSERVATION.SpectralResolutionOb5a[0].value
            : OBSERVATION.SpectralResolutionOb5aZoom.find(
                item => item.bandWidthValue.toString() === bandwidth.toString()
              ).value;
        case BAND_5B:
          return isContinuum()
            ? OBSERVATION.SpectralResolutionOb5b[0].value
            : OBSERVATION.SpectralResolutionOb5bZoom.find(
                item => item.bandWidthValue.toString() === bandwidth.toString()
              ).value;
        default:
          // LOW
          return isContinuum()
            ? OBSERVATION.SpectralResolutionObLow[0].value
            : OBSERVATION.SpectralResolutionObLowZoom.find(
                item => item.bandWidthValue === bandwidth
              ).value;
      }
    };

    const calculateEffectiveResolution = () => {
      // TODO : Replace multipliers with appropriate constants to clarify code  (e.g. What is the purpose of 100000 ? )
      const arr = String(calculateSpectralResolution()).split(' ');
      if (arr.length > 2) {
        const resolution = Number(arr[0]);
        const effectiveResolutionValue = resolution * spectralAveraging;
        const freqMultiplier = isLow() ? 1000000 : 1000000000;
        const freq = getScaledValue(centralFrequency, freqMultiplier, '*');
        const decimal = isContinuum() ? 2 : 1;
        const multiplier = !isLow() || isContinuum() ? 1000 : 1;
        const velocity = calculateVelocity(effectiveResolutionValue * multiplier, freq);
        return `${(resolution * spectralAveraging).toFixed(decimal)} ${arr[1]} (${velocity})`;
      } else {
        return '';
      }
    };

    setSpectralResolution(calculateSpectralResolution());
    setEffectiveResolution(calculateEffectiveResolution());
    setValidateToggle(!validateToggle);
  }, [calculateToggle]);

  React.useEffect(() => {
    if (isContinuumOnly()) {
      setObservationType(TYPE_CONTINUUM);
    }
    setValidateToggle(!validateToggle);
  }, [subarrayConfig]);

  // TODO : Dirty fix
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

  const calculateCentralFrequency = (ob: number, sc: number) => {
    switch (ob) {
      case BAND_1:
        return lookupArrayValue(OBSERVATION.CentralFrequencyOB1, sc);
      case BAND_2:
        return lookupArrayValue(OBSERVATION.CentralFrequencyOB2, sc);
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
        if (isContinuum()) {
          setContinuumBandwidth(lookupArrayValue(OBSERVATION.ContinuumBandwidthOB1, sc));
        }
        return;
      case BAND_2:
        setContinuumBandwidth(lookupArrayValue(OBSERVATION.ContinuumBandwidthOB2, sc));
        return;
      case BAND_5A:
        setContinuumBandwidth(lookupArrayValue(OBSERVATION.ContinuumBandwidthOB5a, sc));
        return;
      case BAND_5B:
        setContinuumBandwidth(lookupArrayValue(OBSERVATION.ContinuumBandwidthOB5b, sc));
        return;
      default:
        if (isContinuum()) {
          setContinuumBandwidth(lookupArrayValue(OBSERVATION.ContinuumBandwidthOBLow, sc));
        }
    }
  };

  React.useEffect(() => {
    const calculateSubarray = () => {
      if (observingBand !== BAND_5A && observingBand !== BAND_5B) {
        if (subarrayConfig === OB_SUBARRAY_AA4_15) {
          setSubarrayConfig(OB_SUBARRAY_AA4);
        }
      } else {
        if (subarrayConfig === OB_SUBARRAY_AA_STAR) {
          setSubarrayConfig(OB_SUBARRAY_AA_STAR_15);
        }
        if (subarrayConfig === OB_SUBARRAY_AA4 || subarrayConfig === OB_SUBARRAY_AA4_13) {
          setSubarrayConfig(OB_SUBARRAY_AA4_15);
        }
      }
    };
    calculateSubarray();
    setCalculateToggle(!calculateToggle);
  }, [observingBand]);

  React.useEffect(() => {
    setCalculateToggle(!calculateToggle);
  }, [bandwidth, centralFrequency, observationType, spectralAveraging]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW;
  const telescope = () => BANDWIDTH_TELESCOPE[observingBand]?.telescope;

  const isContinuumOnly = () =>
    subarrayConfig === OB_SUBARRAY_AA05 ||
    subarrayConfig === OB_SUBARRAY_AA1 ||
    (isLow() && subarrayConfig === OB_SUBARRAY_AA2);

  const taperingField = () => {
    const frequencyInGHz = () => {
      return getScaledValue(centralFrequency, MULTIPLIER_HZ_GHZ[centralFrequencyUnits], '*');
    };

    const getOptions = () => {
      const results = [{ label: t('tapering.0'), value: 0 }];
      [0.25, 1, 4, 16, 64, 256, 1024].forEach(inValue => {
        const theLabel = (inValue * (1.4 / frequencyInGHz())).toFixed(3) + '"';
        results.push({ label: theLabel, value: inValue });
      });
      return results;
    };

    return fieldDropdown(false, 'tapering', getOptions(), true, setTapering, null, tapering);
  };

  const groupObservationsField = () => (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={0} item xs={12}>
        <GroupObservationsField
          labelWidth={LABEL_WIDTH_OPT1}
          onFocus={() => helpComponent(t('groupObservations.help'))}
          setValue={setGroupObservation}
          value={groupObservation}
          obsId={myObsId}
        />
      </Grid>
    </Grid>
  );

  const imageWeightingField = () => (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={0} item xs={12}>
        <ImageWeightingField
          labelWidth={LABEL_WIDTH_OPT1}
          onFocus={() => helpComponent(t('imageWeighting.help'))}
          setValue={setImageWeighting}
          value={imageWeighting}
        />
      </Grid>
    </Grid>
  );

  const bandwidthField = () => {
    interface BandwidthOptions {
      label: string;
      value: number;
      mapping: string;
    }
    const getOptions = (): BandwidthOptions[] => {
      return OBSERVATION.array[telescope() - 1].bandWidth;
    };
    const roundBandwidthValue = (options: BandwidthOptions[]): BandwidthOptions[] =>
      options.map(obj => {
        return {
          label: `${parseFloat(obj.label).toFixed(1)} ${obj.label.split(' ')[1]}`,
          value: obj.value,
          mapping: obj.mapping
        };
      });
    return fieldDropdown(
      false,
      'bandwidth',
      isLow() ? roundBandwidthValue(getOptions()) : getOptions(),
      true,
      setBandwidth,
      null,
      bandwidth
    );
  };

  const robustField = () => {
    return fieldDropdown(false, 'robust', ROBUST, true, setRobust, null, robust);
  };

  const spectralResolutionField = () => {
    return (
      <TextEntry
        testId="spectralResolution"
        value={
          !isContinuum() && observingBand === BAND_LOW
            ? roundSpectralResolution(spectralResolution)
            : spectralResolution
        }
        label={t('spectralResolution.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        onFocus={() => helpComponent(t('spectralResolution.help'))}
        disabled
      />
    );
  };

  const fieldDropdown = (
    disabled: boolean,
    field: string,
    options: { label: string; value: string | number }[],
    required: boolean,
    setValue: Function,
    suffix,
    value: string | number
  ) => {
    return (
      <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - FIELD_WIDTH_BUTTON : 12}>
          <DropDown
            disabled={disabled}
            options={options}
            testId={field}
            value={value}
            setValue={setValue}
            label={t(field + '.label')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={suffix ? LABEL_WIDTH_OPT1 + 1 : LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t(field + '.help'))}
            required={required}
          />
        </Grid>
        <Grid item xs={suffix ? FIELD_WIDTH_BUTTON : 0}>
          {suffix}
        </Grid>
      </Grid>
    );
  };

  const suppliedTypeField = () => {
    const getOptions = () => (isLow() ? [OBSERVATION?.Supplied[0]] : OBSERVATION?.Supplied);

    return (
      <Box pb={2}>
        <DropDown
          options={getOptions()}
          testId="suppliedType"
          value={suppliedType}
          setValue={setSuppliedType}
          disabled={getOptions().length < 2}
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
      <Box>
        <DropDown
          options={getOptions()}
          testId="suppliedUnits"
          value={suppliedUnits}
          disabled={isLow()}
          setValue={setSuppliedUnits}
          label=""
          onFocus={() => helpComponent(t('suppliedUnits.help'))}
        />
      </Box>
    );
  };

  const suppliedValueField = () => {
    const errorMessage = () => {
      return suppliedValue <= 0 ? t('suppliedValue.range.error') : '';
    };
    return (
      <Box sx={{ height: '5rem' }}>
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
      </Box>
    );
  };

  const suppliedField = () => (
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={LABEL_WIDTH_SELECT}>
        {suppliedTypeField()}
      </Grid>
      <Grid item xs={12 - LABEL_WIDTH_SELECT}>
        {suppliedValueField()}
      </Grid>
    </Grid>
  );

  const elevationUnitsField = () => ELEVATION_UNITS;

  const elevationField = () => {
    const errorMessage = () => {
      return elevation < ELEVATION_MIN || elevation > ELEVATION_MAX
        ? t('elevation.range.error')
        : '';
    };

    return (
      <NumberEntry
        errorText={errorMessage()}
        label={t('elevation.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="elevation"
        value={elevation}
        setValue={setElevation}
        onFocus={() => helpComponent(t('elevation.help'))}
        suffix={elevationUnitsField()}
      />
    );
  };

  const weatherUnitsField = () => t('weather.units');

  const weatherField = () => {
    const errorMessage = () => {
      const min = Number(t('weather.range.lower'));
      const max = Number(t('weather.range.upper'));
      return weather < min || weather > max ? t('weather.range.error') : '';
    };

    return (
      <NumberEntry
        errorText={errorMessage()}
        label={t('weather.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_SELECT}
        testId="weather"
        value={weather}
        setValue={setWeather}
        onFocus={() => helpComponent(t('weather.help'))}
        suffix={weatherUnitsField()}
      />
    );
  };

  const centralFrequencyUnitsField = () => {
    const FrequencyUnitOptions = OBSERVATION.array.find(item => item.value === telescope())
      ?.centralFrequencyAndBandWidthUnits;
    if (FrequencyUnitOptions?.length === 1) {
      return FrequencyUnitOptions[0].label;
    } else {
      return (
        <DropDown
          options={FrequencyUnitOptions}
          testId="frequencyUnits"
          value={centralFrequencyUnits}
          setValue={setCentralFrequencyUnits}
          label=""
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      );
    }
  };

  const centralFrequencyField = () => {
    const errorMessage = () =>
      Number(centralFrequency) < CENTRAL_FREQUENCY_MIN[observingBand] ||
      Number(centralFrequency) > CENTRAL_FREQUENCY_MAX[observingBand]
        ? t('centralFrequency.range.error')
        : '';

    return (
      <NumberEntry
        label={t('centralFrequency.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="centralFrequency"
        value={centralFrequency}
        setValue={setCentralFrequency}
        onFocus={() => helpComponent(t('centralFrequency.help'))}
        required
        suffix={centralFrequencyUnitsField()}
        errorText={errorMessage()}
      />
    );
  };

  const SubBandsField = () => {
    const errorMessage = () => {
      const min = Number(t('subBands.range.lower'));
      const max = Number(t('subBands.range.upper'));
      return subBands < min || subBands > max ? t('subBands.range.error') : '';
    };

    const validate = (e: number) => {
      setSubBands(Number(Math.abs(e).toFixed(0)));
    };

    return (
      <NumberEntry
        errorText={errorMessage()}
        label={t('subBands.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="subBands"
        value={subBands}
        setValue={validate}
        onFocus={() => helpComponent(t('subBands.help'))}
        required
      />
    );
  };

  const continuumBandwidthUnitsField = () => {
    // Use the central frequency units for now, as I see this being dropped soon anyway.
    const options = OBSERVATION.array.find(item => item.value === telescope())
      ?.centralFrequencyAndBandWidthUnits;
    if (options?.length === 1) {
      return options[0].label;
    } else {
      return (
        <DropDown
          options={options}
          testId="continuumBandwidthUnits"
          value={continuumBandwidthUnits}
          setValue={setContinuumBandwidthUnits}
          label=""
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      );
    }
  };

  const continuumBandwidthField = () => {
    const findBandwidthLimits = () => {
      const bandWidthData = BANDWIDTH_TELESCOPE.find(item => item.value === observingBand);
      return {
        upper: bandWidthData.upper,
        lower: bandWidthData.lower,
        units: bandWidthData.units
      };
    }
    const errorMessage = () => {
      const limits = findBandwidthLimits();
      console.log('limits', limits);
      console.log('continuumBandwidthUnits', continuumBandwidthUnits);
      if (continuumBandwidth > limits.upper) {
        return t('continuumBandWidth.range.error');
      }
      if (continuumBandwidth < limits.lower) {
        return t('continuumBandWidth.range.error');
      }
      return '';
      // TODO : handle units
      // TODO : handle zooms
    };
    const validate = (e: React.SetStateAction<number>) => {
      setContinuumBandwidth(Number(e) < 0 ? 0 : e);
    };

    return (
      <NumberEntry
        label={t('continuumBandWidth.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        suffix={continuumBandwidthUnitsField()}
        testId="continuumBandwidth"
        value={continuumBandwidth}
        setValue={validate}
        onFocus={() => helpComponent(t('continuumBandWidth.help'))}
        required
        errorText={errorMessage()}
      />
    );
  };

  const calculateVelocity = (resolutionHz: number, frequencyHz: number, precision = 1) => {
    const speedOfLight = 299792458;
    const velocity = frequencyHz > 0 ? (resolutionHz / frequencyHz) * speedOfLight : 0;
    if (velocity < 1000) {
      return velocity.toFixed(precision) + ' m/s';
    } else {
      return (velocity / 1000).toFixed(precision) + ' km/s';
    }
  };

  const getScaledValue = (value: any, multiplier: number, operator: string) => {
    let val_scaled = 0;
    switch (operator) {
      case '*':
        val_scaled = value * multiplier;
        break;
      case '/':
        val_scaled = value / multiplier;
        break;
      default:
        val_scaled = value;
    }
    return val_scaled;
  };

  const effectiveResolutionField = () => {
    return (
      <TextEntry
        label={t('effectiveResolution.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="effectiveResolution"
        value={effectiveResolution}
        onFocus={() => helpComponent(t('effectiveResolution.help'))}
        errorText={effectiveResolution === '' ? t('effectiveResolution.error') : ''}
        disabled
      />
    );
  };

  const AntennasFields = () => {
    return (
      <Grid pb={0} pt={1} container direction="row">
        <Grid item pt={1} xs={6}>
          <InputLabel disabled={subarrayConfig !== 20} shrink={false} htmlFor="numOf15mAntennas">
            <Typography
              sx={{ fontWeight: subarrayConfig === OB_SUBARRAY_CUSTOM ? 'bold' : 'normal' }}
            >
              {t('numOfAntennas.label')}
            </Typography>
          </InputLabel>
        </Grid>
        <Grid item xs={3}>
          {NumOf15mAntennasField()}
        </Grid>
        <Grid item xs={3}>
          {numOf13mAntennasField()}
        </Grid>
      </Grid>
    );
  };

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
        label={t('numOf15mAntennas.short')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="numOf15mAntennas"
        value={numOf15mAntennas}
        setValue={validate}
        onFocus={() => helpComponent(t('numOf15mAntennas.help'))}
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
        label={t('numOf13mAntennas.short')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="numOf13mAntennas"
        value={numOf13mAntennas}
        setValue={validate}
        onFocus={() => helpComponent(t('numOf13mAntennas.help'))}
      />
    );
  };

  const addButtonDisabled = () => {
    // TODO : We need to ensure we are able to progress.
    return false;
  };

  const pageFooter = () => {
    const addObservationToProposal = () => {
      const newObservation: Observation = observationOut();
      setProposal({
        ...getProposal(),
        observations: [...getProposal().observations, newObservation]
      });
    };

    const updateObservationOnProposal = () => {
      const newObservation: Observation = observationOut();

      const oldObservations = getProposal().observations;
      const newObservations: Observation[] = [];
      if (oldObservations.length > 0) {
        oldObservations.forEach(inValue => {
          newObservations.push(inValue.id === newObservation.id ? newObservation : inValue);
        });
      } else {
        newObservations.push(newObservation);
      }

      const updateSensCalcPartial = (ob: Observation) => {
        const result = getProposal().targetObservation.map(rec => {
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
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid item />
          <Grid item />
          <Grid item>
            <AddButton
              action={buttonClicked}
              disabled={addButtonDisabled()}
              primary
              testId={isEdit() ? 'updateObservationButton' : 'addObservationButton'}
              title={isEdit() ? 'button.update' : 'button.add'}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box pt={2}>
      <PageBanner backPage={BACK_PAGE} pageNo={PAGE} />
      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
        spacing={1}
      >
        <Grid item md={12} lg={9}>
          <Grid
            container
            direction="row"
            alignItems="center"
            gap={1}
            spacing={1}
            pb={3}
            justifyContent="space-evenly"
          >
            <Grid item xs={XS_TOP}>
              {groupObservationsField()}
            </Grid>
            <Grid item xs={XS_TOP}></Grid>
            <Grid item xs={XS_TOP}>
              <ObservingBandField required value={observingBand} setValue={setTheObservingBand} />
            </Grid>
            <Grid item xs={XS_TOP}></Grid>
            <Grid item xs={XS_TOP}>
              <SubArrayField
                observingBand={observingBand}
                required
                telescope={telescope()}
                value={subarrayConfig}
                setValue={setTheSubarrayConfig}
              />
            </Grid>
            <Grid item xs={XS_TOP}>
              {isLow() ? (
                <NumStations
                  disabled={subarrayConfig !== 20}
                  setValue={setNumOfStations}
                  value={numOfStations}
                  rangeLower={Number(t('numStations.range.lower'))}
                  rangeUpper={Number(t('numStations.range.upper'))}
                />
              ) : (
                AntennasFields()
              )}
            </Grid>
            <Grid item xs={XS_TOP}>
              {elevationField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {!isLow() && weatherField()}
            </Grid>
          </Grid>
          <Card variant="outlined">
            <CardContent>
              <Grid
                container
                direction="row"
                alignItems="center"
                gap={1}
                justifyContent="space-evenly"
              >
                <Grid item xs={XS_BOTTOM}>
                  <ObservationTypeField
                    disabled={isContinuumOnly()}
                    isContinuumOnly={isContinuumOnly()}
                    required
                    value={observationType}
                    setValue={setObservationType}
                  />
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {suppliedField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {centralFrequencyField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {isContinuum() ? continuumBandwidthField() : bandwidthField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {spectralResolutionField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  <SpectralAveragingField
                    isLow={isLow()}
                    value={spectralAveraging}
                    setValue={setSpectralAveraging}
                    subarray={subarrayConfig}
                    type={observationType}
                  />
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {effectiveResolutionField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {!isLow() && taperingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {isContinuum() && SubBandsField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeightingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}></Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeighting === IW_BRIGGS && robustField()}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={12} lg={3}>
          <HelpPanel />
        </Grid>
      </Grid>
      {pageFooter()}
    </Box>
  );
}
