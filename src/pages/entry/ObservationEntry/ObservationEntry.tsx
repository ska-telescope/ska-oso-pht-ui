import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Grid, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { DropDown, NumberEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../../components/layout/pageBanner/PageBanner';
import {
  BANDWIDTH_TELESCOPE,
  CENTRAL_FREQUENCY_MAX,
  CENTRAL_FREQUENCY_MIN,
  ELEVATION_DEFAULT,
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
  FREQUENCY_KHZ,
  FREQUENCY_MHZ,
  FREQUENCY_GHZ
} from '../../../utils/constants';
import HelpPanel from '../../../components/info/helpPanel/helpPanel';
import Proposal from '../../../utils/types/proposal';
import { frequencyConversion, generateId } from '../../../utils/helpers';
import AddButton from '../../../components/button/Add/Add';
import ImageWeightingField from '../../../components/fields/imageWeighting/imageWeighting';
import GroupObservationsField from '../../../components/fields/groupObservations/groupObservations';
import Observation from '../../../utils/types/observation';
import TargetObservation from '../../../utils/types/targetObservation';
import SubArrayField from '../../../components/fields/subArray/SubArray';
import ObservingBandField from '../../../components/fields/observingBand/ObservingBand';
import ObservationTypeField from '../../../components/fields/observationType/ObservationType';
import EffectiveResolutionField from '../../../components/fields/effectiveResolution/EffectiveResolution';
import ElevationField from '../../../components/fields/elevation/Elevation';
import RobustField from '../../../components/fields/robust/Robust';
import SpectralAveragingField from '../../../components/fields/spectralAveraging/SpectralAveraging';
import SpectralResolutionField from '../../../components/fields/spectralResolution/SpectralResolution';
import NumStations from '../../../components/fields/numStations/NumStations';
import ContinuumBandwidthField from '../../../components/fields/continuumBandwidth/continuumBandwidth';
import BandwidthField from '../../../components/fields/bandwidth/bandwidth';

const TOP_LABEL_WIDTH = 6;
const BOTTOM_LABEL_WIDTH = 6;

const BACK_PAGE = 5;
const WRAPPER_WIDTH_BUTTON = 2;

const HELP_PANEL_HEIGHT = '50vh';

const WRAPPER_HEIGHT = '80px';
const WRAPPER_WIDTH = '500px';

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
  const [centralFrequencyUnits, setCentralFrequencyUnits] = React.useState(FREQUENCY_GHZ);
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
  const [numOfStations, setNumOfStations] = React.useState(0);
  const [validateToggle, setValidateToggle] = React.useState(false);

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

  // TODO expand on this to fix 5a band default value issue when switching from Low
  React.useEffect(() => {
    const calculateSubarray = () => {
      if (isEdit()) {
        return;
      }
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
  }, [observingBand]);

  React.useEffect(() => {
    const setFrequencyUnits = () => {
      if (observingBand === BAND_LOW) {
        setCentralFrequencyUnits(FREQUENCY_MHZ);
      }
    };
    setFrequencyUnits();
  }, [observingBand]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === BAND_LOW;
  const telescope = () => BANDWIDTH_TELESCOPE[observingBand]?.telescope;

  const isContinuumOnly = () =>
    subarrayConfig === OB_SUBARRAY_AA05 || subarrayConfig === OB_SUBARRAY_AA1;

  const fieldWrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      {children}
    </Box>
  );

  const suppliedWrapper = (children: React.JSX.Element) => (
    <Box p={0} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      {children}
    </Box>
  );

  const emptyField = () => {
    return <Grid item>{fieldWrapper()}</Grid>;
  };

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

    return (
      <Grid item>
        {fieldDropdown(
          false,
          'tapering',
          BOTTOM_LABEL_WIDTH,
          getOptions(),
          true,
          setTapering,
          null,
          tapering
        )}
      </Grid>
    );
  };

  const groupObservationsField = () => (
    <Grid item>
      {fieldWrapper(
        <GroupObservationsField
          labelWidth={TOP_LABEL_WIDTH}
          onFocus={() => helpComponent(t('groupObservations.help'))}
          setValue={setGroupObservation}
          value={groupObservation}
          obsId={myObsId}
        />
      )}
    </Grid>
  );

  const observationsBandField = () => (
    <Grid item>
      {fieldWrapper(
        <ObservingBandField
          widthLabel={TOP_LABEL_WIDTH}
          required
          value={observingBand}
          setValue={setTheObservingBand}
        />
      )}
    </Grid>
  );

  const subArrayField = () => (
    <Grid item>
      {fieldWrapper(
        <SubArrayField
          observingBand={observingBand}
          required
          widthLabel={TOP_LABEL_WIDTH}
          telescope={telescope()}
          value={subarrayConfig}
          setValue={setTheSubarrayConfig}
        />
      )}
    </Grid>
  );

  const numStationsField = () => (
    <Grid item>
      {fieldWrapper(
        <NumStations
          disabled={subarrayConfig !== OB_SUBARRAY_CUSTOM}
          widthLabel={TOP_LABEL_WIDTH}
          setValue={setNumOfStations}
          value={numOfStations}
          rangeLower={Number(t('numStations.range.lower'))}
          rangeUpper={Number(t('numStations.range.upper'))}
        />
      )}
    </Grid>
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

    return (
      <Grid item>
        {fieldWrapper(
          <Grid container direction="row">
            <Grid pt={1} item xs={TOP_LABEL_WIDTH}>
              <InputLabel
                disabled={subarrayConfig !== 20}
                shrink={false}
                htmlFor="numOf15mAntennas"
              >
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
        )}
      </Grid>
    );
  };

  const elevationField = () => (
    <Grid item>
      {fieldWrapper(
        <ElevationField
          isLow={isLow()}
          label={t('elevation.label')}
          widthLabel={TOP_LABEL_WIDTH}
          onFocus={() => helpComponent(t('elevation.help'))}
          setValue={setElevation}
          testId="elevation"
          value={elevation}
        />
      )}
    </Grid>
  );

  const weatherField = () => {
    const errorMessage = () => {
      const min = Number(t('weather.range.lower'));
      const max = Number(t('weather.range.upper'));
      return weather < min || weather > max ? t('weather.range.error') : '';
    };

    const weatherUnitsField = () => t('weather.units');

    return (
      <Grid item>
        {fieldWrapper(
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
        )}
      </Grid>
    );
  };

  /**************************************************************/

  const observationTypeField = () => (
    <Grid item>
      {fieldWrapper(
        <ObservationTypeField
          disabled={isContinuumOnly()}
          isContinuumOnly={isContinuumOnly()}
          widthLabel={BOTTOM_LABEL_WIDTH}
          required
          value={observationType}
          setValue={setObservationType}
        />
      )}
    </Grid>
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

    return (
      <Grid item>
        {suppliedWrapper(
          <Grid pt={0} m={0} container>
            <Grid item pt={1} pr={1} md={BOTTOM_LABEL_WIDTH}>
              {suppliedTypeField()}
            </Grid>
            <Grid item pt={0} md={12 - BOTTOM_LABEL_WIDTH}>
              {suppliedValueField()}
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  };

  const centralFrequencyField = () => {
    const errorMessage = () =>
      Number(centralFrequency) < CENTRAL_FREQUENCY_MIN[observingBand] ||
      Number(centralFrequency) > CENTRAL_FREQUENCY_MAX[observingBand]
        ? t('centralFrequency.range.error')
        : '';
    return (
      <Grid item>
        {fieldWrapper(
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
        )}
      </Grid>
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
          disabled={options.length === 1}
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      );
    };
    return (
      <Grid item>
        {fieldWrapper(
          <ContinuumBandwidthField
            labelWidth={BOTTOM_LABEL_WIDTH}
            onFocus={() => helpComponent(t('continuumBandWidth.help'))}
            setValue={setContinuumBandwidth}
            value={continuumBandwidth}
            suffix={continuumBandwidthUnitsField()}
            telescope={telescope()}
            observingBand={observingBand}
            continuumBandwidthUnits={continuumBandwidthUnits}
            centralFrequency={centralFrequency}
            centralFrequencyUnits={centralFrequencyUnits}
            subarrayConfig={subarrayConfig}
          />
        )}
      </Grid>
    );
  };

  const bandwidthField = () => (
    <Grid item>
      {fieldWrapper(
        <BandwidthField
          onFocus={() => helpComponent(t('bandwidth.help'))}
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
        />
      )}
    </Grid>
  );

  const spectralResolutionField = () => (
    <Grid item>
      {fieldWrapper(
        <SpectralResolutionField
          bandWidth={isContinuum() ? continuumBandwidth : bandwidth}
          bandWidthUnits={
            isContinuum() ? continuumBandwidthUnits : isLow() ? FREQUENCY_KHZ : FREQUENCY_MHZ
          }
          frequency={centralFrequency}
          frequencyUnits={centralFrequencyUnits}
          label={t('spectralResolution.label')}
          labelWidth={BOTTOM_LABEL_WIDTH}
          observingBand={observingBand}
          observationType={observationType}
          onFocus={() => helpComponent(t('spectralResolution.help'))}
          setValue={setSpectralResolution}
        />
      )}
    </Grid>
  );

  const spectralAveragingField = () => (
    <Grid item>
      {fieldWrapper(
        <SpectralAveragingField
          isLow={isLow()}
          widthLabel={BOTTOM_LABEL_WIDTH}
          value={spectralAveraging}
          setValue={setSpectralAveraging}
          subarray={subarrayConfig}
          type={observationType}
        />
      )}
    </Grid>
  );

  const effectiveResolutionField = () => (
    <Grid item>
      {fieldWrapper(
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
      )}
    </Grid>
  );

  const imageWeightingField = () => (
    <Grid item>
      {fieldWrapper(
        <ImageWeightingField
          labelWidth={BOTTOM_LABEL_WIDTH}
          onFocus={() => helpComponent(t('imageWeighting.help'))}
          setValue={setImageWeighting}
          value={imageWeighting}
        />
      )}
    </Grid>
  );

  const robustField = () => (
    <Grid item>
      {fieldWrapper(
        <RobustField
          label={t('robust.label')}
          setValue={setRobust}
          testId="robust"
          value={robust}
          widthButton={WRAPPER_WIDTH_BUTTON}
          widthLabel={BOTTOM_LABEL_WIDTH}
        />
      )}
    </Grid>
  );

  const fieldDropdown = (
    disabled: boolean,
    field: string,
    labelWidth: number,
    options: { label: string; value: string | number }[],
    required: boolean,
    setValue: Function,
    suffix,
    value: string | number
  ) => {
    return fieldWrapper(
      <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - WRAPPER_WIDTH_BUTTON : 12}>
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
        </Grid>
        <Grid item xs={suffix ? WRAPPER_WIDTH_BUTTON : 0}>
          {suffix}
        </Grid>
      </Grid>
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
        disabled={options.length === 1}
        onFocus={() => helpComponent(t('frequencyUnits.help'))}
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
      <Grid item>
        {fieldWrapper(
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
        )}
      </Grid>
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
    <>
      <PageBanner backPage={BACK_PAGE} pageNo={PAGE} />
      <Grid
        pl={4}
        pr={4}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid item md={12} lg={9}>
          <Grid
            p={0}
            container
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent="space-between"
          >
            {groupObservationsField()}
            {weatherField()}
            {observationsBandField()}
            {elevationField()}
            {subArrayField()}
            {isLow() ? numStationsField() : antennasFields()}

            {observationTypeField()}
            {suppliedField()}
            {centralFrequencyField()}
            {isContinuum() ? continuumBandwidthField() : bandwidthField()}
            {spectralResolutionField()}
            {spectralAveragingField()}
            {effectiveResolutionField()}
            {isContinuum() ? SubBandsField() : emptyField()}
            {imageWeightingField()}
            {imageWeighting === IW_BRIGGS ? robustField() : emptyField()}
            {isLow() ? emptyField() : taperingField()}
          </Grid>
        </Grid>
        <Grid item md={12} lg={3}>
          <Box pl={4}>
            <HelpPanel minHeight={HELP_PANEL_HEIGHT} maxHeight={HELP_PANEL_HEIGHT} />
          </Box>
        </Grid>
      </Grid>
      {pageFooter()}
    </>
  );
}
