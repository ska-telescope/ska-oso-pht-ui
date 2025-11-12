import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
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
  LAB_IS_BOLD,
  LAB_POSITION,
  NAV,
  BAND_LOW,
  STATUS_PARTIAL,
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
  PAGE_OBSERVATION_ADD
} from '@utils/constants.ts';
import {
  generateId,
  getMinimumChannelWidth,
  getScaledBandwidthOrFrequency
} from '@utils/helpers.ts';
import PageBannerPPT from '../../../components/layout/pageBannerPPT/PageBannerPPT';
import HelpPanel from '../../../components/info/helpPanel/HelpPanel';
import Proposal from '../../../utils/types/proposal';
import AddButton from '../../../components/button/Add/Add';
import GroupObservationsField from '../../../components/fields/groupObservations/groupObservations';
import Observation from '../../../utils/types/observation';
import TargetObservation from '../../../utils/types/targetObservation';
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

const TOP_LABEL_WIDTH = 6;
const BOTTOM_LABEL_WIDTH = 4;
const BACK_PAGE = PAGE_OBSERVATION;
const HELP_PANEL_HEIGHT = '50vh';
const MOCK_CALL = true;

export default function ObservationEntry() {
  const { t } = useScopedTranslation();
  const navigate = useNavigate();
  const locationProperties = useLocation();
  const { osdLOW, osdMID, observatoryConstants } = useOSDAccessors();

  const isEdit = () => locationProperties.state !== null;

  const PAGE = isEdit() ? PAGE_OBSERVATION_UPDATE : PAGE_OBSERVATION_ADD;

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

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
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState<number | undefined>(4);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState<number | undefined>(0);
  const [numOfStations, setNumOfStations] = React.useState<number | undefined>(512);
  const [validateToggle, setValidateToggle] = React.useState(false);
  const [minimumChannelWidthHz, setMinimumChannelWidthHz] = React.useState<number>(0);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [myObsId, setMyObsId] = React.useState('');
  const [obOnce, setObOnce] = React.useState<Observation | null>(null);
  const isAA2 = (subarrayConfig: number) => subarrayConfig === OB_SUBARRAY_AA2;

  const observationIn = (ob: Observation) => {
    setMyObsId(ob?.id);
    setSubarrayConfig(ob?.subarray);
    setObservationType(ob?.type);
    if (!obOnce) setObservingBand(ob?.observingBand);
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
      if (!isLow() && isAA2(record.value)) {
        setNumOf15mAntennas(osdMID?.AA2?.numberSkaDishes ?? undefined);
      } else {
        setNumOf15mAntennas(record.numOf15mAntennas);
      }
    }
    setNumOf13mAntennas(record?.numOf13mAntennas);
    setDefaultCentralFrequency(observingBand, e as number);
    setDefaultContinuumBandwidth(observingBand, e as number);
    setSubarrayConfig(e);
  };

  React.useEffect(() => {
    helpComponent(t('observationId.help'));
    if (isEdit()) {
      observationIn(locationProperties.state);
      setObOnce(locationProperties.state);
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

    if (obOnce) {
      // We just need to do this one more time as some fields could not be updated until observingBand has changed.
      observationIn(obOnce);
      setObOnce(null);
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
  const isLow = () => observingBand === BAND_LOW;
  const telescope = (band = observingBand) => BANDWIDTH_TELESCOPE[band]?.telescope;

  const isContinuumOnly = () => observingBand !== 0 && subarrayConfig === OB_SUBARRAY_AA2;

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
          disabledUnderline={subarrayConfig !== 20}
          label={t('numOf13mAntennas.short')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={BOTTOM_LABEL_WIDTH}
          testId="numOf13mAntennas"
          value={numOf13mAntennas}
          setValue={validate}
          onFocus={() => helpComponent(t('numOf13mAntennas.help'))}
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
        disabled={MOCK_CALL || isContinuumOnly()}
        isContinuumOnly={isContinuumOnly()}
        widthLabel={BOTTOM_LABEL_WIDTH}
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
            onFocus={() => helpComponent(t('suppliedType.help'))}
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
      <Grid pt={0} m={0} container justifyContent="space-between" direction="row">
        <Grid pt={1} pr={1} size={{ md: 5 }}>
          {suppliedTypeField()}
        </Grid>
        <Grid pt={0} size={{ md: 10 - BOTTOM_LABEL_WIDTH }} justifySelf="flex-end">
          {suppliedValueField()}
        </Grid>
      </Grid>
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
    <Grid>
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
              action={buttonClicked}
              disabled={addButtonDisabled()}
              primary
              testId={isEdit() ? 'updateObservationButtonEntry' : 'addObservationButtonEntry'}
              title={isEdit() ? 'updateBtn.label' : 'addBtn.label'}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box pt={2}>
      <PageBannerPPT backPage={BACK_PAGE} pageNo={PAGE} />
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
          {!MOCK_CALL && (
            <Grid
              p={0}
              pl={2}
              container
              direction="row"
              alignItems="center"
              spacing={1}
              justifyContent="space-around"
            >
              <Grid size={{ md: 12, lg: 5 }}>{idField()}</Grid>
              <Grid size={{ md: 12, lg: 5 }}>{groupObservationsField()}</Grid>
              <Grid size={{ md: 12, lg: 5 }}>{isLow() ? emptyField() : weatherField()}</Grid>
              <Grid size={{ md: 12, lg: 5 }}>{elevationField()}</Grid>
            </Grid>
          )}
          <Grid
            container
            direction="row"
            spacing={2}
            pb={3}
            alignItems="stretch"
            justifyContent="space-between"
          >
            <Grid size={{ md: 6, lg: 6 }}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'block', minHeight: '190px' }}>
                  <Grid
                    pr={13}
                    container
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Grid size={{ md: 12, lg: 12 }}>{observationTypeField()}</Grid>
                    <Grid size={{ md: 12, lg: 12 }}></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ md: 6, lg: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Grid
                    p={0}
                    container
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Grid size={{ md: 12, lg: 12 }}>{subArrayField()}</Grid>
                    {!MOCK_CALL && (
                      <Grid size={{ md: 12, lg: 12 }}>
                        {isLow() ? numStationsField() : antennasFields()}
                      </Grid>
                    )}
                    <Grid size={{ md: 12, lg: 12 }}>{suppliedField()}</Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card variant="outlined">
            <CardContent>
              <Grid
                p={0}
                container
                direction="row"
                alignItems="center"
                spacing={1}
                justifyContent="space-between"
              >
                <Grid size={{ md: 12, lg: 6 }} pr={15}>
                  {observationsBandField()}
                </Grid>
                <Grid size={{ md: 12, lg: 6 }} pl={4}>
                  {isContinuum() ? continuumBandwidthField() : bandwidthField()}
                </Grid>
                <Grid size={{ md: 12, lg: 6 }} pr={15}>
                  {centralFrequencyField()}
                </Grid>
                <Grid size={{ md: 12, lg: 6 }}></Grid>
                {!MOCK_CALL && (
                  <>
                    <Grid size={{ md: 12, lg: 5 }}>{spectralResolutionField()}</Grid>
                    <Grid size={{ md: 12, lg: 5 }}>{spectralAveragingField()}</Grid>
                    <Grid size={{ md: 12, lg: 5 }}>{effectiveResolutionField()}</Grid>
                    <Grid size={{ md: 12, lg: 5 }}>
                      {isContinuum() ? SubBandsField() : emptyField()}
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ md: 12, lg: 3 }}>
          <Box pl={4} sx={{ position: 'sticky', top: 100 }}>
            <HelpPanel maxHeight={HELP_PANEL_HEIGHT} />
          </Box>
        </Grid>
      </Grid>
      <Spacer size={FOOTER_SPACER} axis={SPACER_VERTICAL} />
      {pageFooter()}
    </Box>
  );
}
