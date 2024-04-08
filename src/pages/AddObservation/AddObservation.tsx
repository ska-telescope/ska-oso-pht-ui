import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  Button,
  ButtonColorTypes,
  ButtonVariantTypes,
  DropDown,
  LABEL_POSITION,
  NumberEntry,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { BANDWIDTH_TELESCOPE, NAV, OBSERVATION, TELESCOPES } from '../../utils/constants';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';
import { helpers } from '../../utils/helpers';

const XS_TOP = 5;
const XS_BOTTOM = 5;
const PAGE = 10;
const BACK_PAGE = 5;

const LABEL_WIDTH_SELECT = 5;
const LABEL_WIDTH_STD = 5;
const LABEL_WIDTH_OPT1 = 6;

const FIELD_WIDTH_OPT1 = 10;

export default function AddObservation() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(1);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(1);
  const [elevation, setElevation] = React.useState(15);
  const [weather, setWeather] = React.useState(3);
  const [frequency, setFrequency] = React.useState('');
  const [effective, setEffective] = React.useState('');
  const [imageWeighting, setImageWeighting] = React.useState(1);
  const [tapering, setTapering] = React.useState(1);
  const [bandwidth, setBandwidth] = React.useState(1);
  const [robust, setRobust] = React.useState(0);
  const [spectralAveraging, setSpectralAveraging] = React.useState(1);
  const [spectralResolution, setSpectralResolution] = React.useState(1);
  const [suppliedType, setSuppliedType] = React.useState(1);
  const [suppliedValue, setSuppliedValue] = React.useState('');
  const [suppliedUnits, setSuppliedUnits] = React.useState(1);
  const [frequencyUnits, setFrequencyUnits] = React.useState(1);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState('');
  const [continuumUnits, setContinuumUnits] = React.useState(1);
  const [subBands, setSubBands] = React.useState(0);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState(0);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState(0);
  const [numOfStations, setNumOfStations] = React.useState(0);
  const [details, setDetails] = React.useState('');
  const [errorTextElevation, setErrorTextElevation] = React.useState('');
  const [errorTextWeather, setErrorTextWeather] = React.useState('');
  const [errorTextSuppliedValue, setErrorTextSuppliedValue] = React.useState('');
  const [errorTextCentralFrequency, setErrorTextCentralFrequency] = React.useState('');
  const [errorTextContinuumBandwidth, setErrorTextContinuumBandwidth] = React.useState('');
  const [errorTextEffectiveResolution, setErrorTextEffectiveResolution] = React.useState('');

  const [formInvalid, setFormInvalid] = React.useState(true);
  const [validateToggle, setValidateToggle] = React.useState(false);

  React.useEffect(() => {
    setNumOf15mAntennas(
      OBSERVATION.array[BANDWIDTH_TELESCOPE[observingBand].telescope - 1].subarray.find(
        element => element.value === subarrayConfig
      ).numOf15mAntennas
    );
    setNumOf13mAntennas(
      OBSERVATION.array[BANDWIDTH_TELESCOPE[observingBand].telescope - 1].subarray.find(
        element => element.value === subarrayConfig
      ).numOf13mAntennas
    );
  }, [subarrayConfig]);

  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [elevation, weather]);

  React.useEffect(() => {
    const invalidForm = Boolean(formValidation());
    setFormInvalid(invalidForm);
  }, [validateToggle]);

  // TODO: implement stricter validations for the fields to ensure successful requests to the Sensitivity Calculator API (type and range of values)
  // some unit conversion will also be useful

  React.useEffect(() => {
    helpComponent(t('observingBand.help'));
  }, []);

  const isContinuum = () => observationType === 1;
  const isLow = () => observingBand === 0;

  function formValidation() {
    let count = 0;
    let emptyField = elevation === '';
    let isValid = !emptyField;
    count += isValid ? 0 : 1;

    // elevation
    emptyField = elevation === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        elevation,
        setElevation,
        setErrorTextElevation,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextElevation('');
    }
    // weather
    emptyField = weather === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        weather,
        setWeather,
        setErrorTextWeather,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextWeather('');
    }
    // supplied value
    emptyField = suppliedValue === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        suppliedValue,
        setSuppliedValue,
        setErrorTextSuppliedValue,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextSuppliedValue('');
    }
    // central frequency
    emptyField = frequency === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        frequency,
        setFrequency,
        setErrorTextCentralFrequency,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextCentralFrequency('');
    }
    // continuum bandwidth
    emptyField = continuumBandwidth === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        frequency,
        setContinuumBandwidth,
        setErrorTextContinuumBandwidth,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextContinuumBandwidth('');
    }
    // effective resolution
    emptyField = effective === '';
    isValid = !emptyField;
    count += isValid ? 0 : 1;
    if (!emptyField) {
      isValid = helpers.validate.validateTextEntry(
        frequency,
        setEffective,
        setErrorTextEffectiveResolution,
        'NUMBER_ONLY'
      );
      count += isValid ? 0 : 1;
    } else {
      setErrorTextEffectiveResolution('');
    }
    return count;
  }

  const subArrayField = () => {
    const getSubArrayOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      return OBSERVATION.array[usedTelescope - 1].subarray.map(e => {
        return {
          label: t('subArrayConfiguration.' + e.value),
          value: e.value
        };
      });
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getSubArrayOptions()}
            testId="subarrayConfig"
            value={subarrayConfig}
            setValue={setSubarrayConfig}
            label={t('subArrayConfiguration.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('subArrayConfiguration.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const observationTypeField = () => (
    <Grid pt={1} spacing={0} container direction="row">
      <Grid item xs={FIELD_WIDTH_OPT1}>
        <DropDown
          options={OBSERVATION.ObservationType}
          testId="observationType"
          value={observationType}
          setValue={setObservationType}
          label={t('observationType.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LABEL_WIDTH_OPT1}
          onFocus={() => helpComponent(t('observationType.help'))}
          required
        />
      </Grid>
    </Grid>
  );

  const observingBandField = () => {
    const getOptions = () => {
      return BANDWIDTH_TELESCOPE
        ? BANDWIDTH_TELESCOPE
        : [{ label: 'Not applicable', telescope: 2, value: 0 }];
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            disabled={!getOptions() || getOptions()?.length < 2}
            testId="observingBand"
            value={observingBand}
            setValue={setObservingBand}
            label={t('observingBand.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('observingBand.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const arrayField = () => {
    const getOptions = () => {
      return TELESCOPES;
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            disabled
            testId="arrayConfiguration"
            value={BANDWIDTH_TELESCOPE[observingBand].telescope}
            label={t('arrayConfiguration.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('arrayConfiguration.help'))}
          />
        </Grid>
      </Grid>
    );
  };

  const imageWeightingField = () => (
    <Grid pt={1} spacing={0} container direction="row">
      <Grid item xs={FIELD_WIDTH_OPT1}>
        <DropDown
          options={OBSERVATION.ImageWeighting}
          testId="imageWeighting"
          value={imageWeighting}
          setValue={setImageWeighting}
          label={t('imageWeighting.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LABEL_WIDTH_OPT1}
          onFocus={() => helpComponent(t('imageWeighting.help'))}
          required
        />
      </Grid>
    </Grid>
  );

  const taperingField = () => (
    <Grid pt={1} spacing={0} container direction="row">
      <Grid item xs={FIELD_WIDTH_OPT1}>
        <DropDown
          options={OBSERVATION.Tapering}
          testId="tapering"
          value={tapering}
          setValue={setTapering}
          label={t('tapering.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LABEL_WIDTH_OPT1}
          onFocus={() => helpComponent(t('tapering.help'))}
          required
        />
      </Grid>
    </Grid>
  );

  const bandwidthField = () => {
    const getOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      return OBSERVATION.array[usedTelescope - 1].bandWidth;
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            testId="bandwidth"
            value={bandwidth}
            setValue={setBandwidth}
            label={t('bandWidth.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('bandWidth.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const robustField = () => {
    const getOptions = () => {
      if (imageWeighting === 2) {
        const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
        return OBSERVATION.array[usedTelescope - 1].robust;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            testId="robust"
            value={robust}
            setValue={setRobust}
            label={t('robust.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('robust.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const spectralResolutionField = () => {
    const getOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      return OBSERVATION.array[usedTelescope - 1].spectralResolution;
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            testId="spectralResolution"
            value={spectralResolution}
            setValue={setSpectralResolution}
            label={t('spectralResolution.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('spectralResolution.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const spectralAveragingField = () => {
    const getOptions = () => OBSERVATION.SpectralAveraging;

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            testId="spectral"
            value={spectralAveraging}
            setValue={setSpectralAveraging}
            label={t('spectralAveraging.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('spectralAveraging.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const suppliedTypeField = () => {
    const getOptions = () => OBSERVATION.Supplied;

    return (
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId="suppliedType"
          value={suppliedType}
          setValue={setSuppliedType}
          label=""
          onFocus={() => helpComponent(t('suppliedType.help'))}
          required
        />
      </Box>
    );
  };

  const suppliedUnitsField = () => {
    const getOptions = () => OBSERVATION.Supplied[suppliedType - 1].units;

    return (
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId="suppliedUnits"
          value={suppliedUnits}
          setValue={setSuppliedUnits}
          label=""
          onFocus={() => helpComponent(t('suppliedUnits.help'))}
        />
      </Box>
    );
  };

  const frequencyUnitsField = () => {
    const getOptions = () => OBSERVATION.Units;

    return (
      <Box pt={0}>
        <DropDown
          options={getOptions()}
          testId="frequencyUnits"
          value={frequencyUnits}
          setValue={setFrequencyUnits}
          label=""
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      </Box>
    );
  };

  const continuumUnitsField = () => {
    const getOptions = () => OBSERVATION.Units;

    return (
      <Box pt={0}>
        <DropDown
          options={getOptions()}
          testId="continuumUnits"
          value={continuumUnits}
          setValue={setContinuumUnits}
          label=""
          onFocus={() => helpComponent(t('continuumUnits.help'))}
        />
      </Box>
    );
  };

  const suppliedValueField = () => (
    <TextEntry
      label=""
      testId="suppliedValue"
      value={suppliedValue}
      setValue={setSuppliedValue}
      onFocus={() => helpComponent(t('suppliedValue.help'))}
      required
      errorText={t(errorTextSuppliedValue)}
    />
  );

  const suppliedField = () => (
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={LABEL_WIDTH_SELECT}>
        {suppliedTypeField()}
      </Grid>
      <Grid item xs={12 - LABEL_WIDTH_SELECT}>
        <Grid
          spacing={0}
          container
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={9}>
            {suppliedValueField()}
          </Grid>
          <Grid item xs={3}>
            {suppliedUnitsField()}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  const elevationField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (num >= Number(t('elevation.range.lower')) && num <= Number(t('elevation.range.upper'))) {
        setElevation(num);
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            label={t('elevation.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="elevation"
            value={elevation}
            setValue={validate}
            onFocus={() => helpComponent(t('elevation.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const weatherField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (num >= Number(t('weather.range.lower')) && num <= Number(t('weather.range.upper'))) {
        setWeather(num);
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            label={t('weather.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="weather"
            value={weather}
            setValue={validate}
            onFocus={() => helpComponent(t('weather.help'))}
            required
          />
        </Grid>
      </Grid>
    );
  };

  const centralFrequencyField = () => (
    <TextEntry
      label={t('centralFrequency.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      testId="frequency"
      value={frequency}
      setValue={setFrequency}
      suffix={frequencyUnitsField()}
      onFocus={() => helpComponent(t('centralFrequency.help'))}
      required
      errorText={t(errorTextCentralFrequency)}
    />
  );

  const SubBandsField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (num >= Number(t('subBands.range.lower')) && num <= Number(t('subBands.range.upper'))) {
        setSubBands(num);
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          {isContinuum() && (
            <NumberEntry
              label={t('subBands.label')}
              labelBold
              labelPosition={LABEL_POSITION.START}
              labelWidth={LABEL_WIDTH_OPT1}
              testId="subBands"
              value={subBands}
              setValue={validate}
              onFocus={() => helpComponent(t('subBands.help'))}
              required
            />
          )}
        </Grid>
      </Grid>
    );
  };

  const continuumBandwidthField = () => (
    <TextEntry
      label={t('continuumBandWidth.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      suffix={continuumUnitsField()}
      testId="continuumBandwidth"
      value={continuumBandwidth}
      setValue={setContinuumBandwidth}
      onFocus={() => helpComponent(t('continuumBandWidth.help'))}
      required
      errorText={t(errorTextContinuumBandwidth)}
    />
  );

  const effectiveResolutionField = () => (
    <TextEntry
      label={t('effectiveResolution.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      testId="effective"
      value={effective}
      setValue={setEffective}
      onFocus={() => helpComponent(t('effectiveResolution.help'))}
      required
      errorText={t(errorTextEffectiveResolution)}
    />
  );

  const AntennasFields = () => {
    return (
      <Grid pb={0} pt={1} container direction="row">
        <Grid item pt={1} xs={5}>
          <InputLabel disabled={subarrayConfig !== 20} shrink={false} htmlFor="numOf15mAntennas">
            <Typography sx={{ fontWeight: subarrayConfig === 20 ? 'bold' : 'normal' }}>
              {t('numOfAntennas.label')}
            </Typography>
          </InputLabel>
        </Grid>
        <Grid item xs={4}>
          {NumOf15mAntennasField()}
        </Grid>
        <Grid item xs={3}>
          {NumOf13mAntennasField()}
        </Grid>
      </Grid>
    );
  };

  const NumOf15mAntennasField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (
        num >= Number(t('numOf15mAntennas.range.lower')) &&
        num <= Number(t('numOf15mAntennas.range.upper'))
      ) {
        setNumOf15mAntennas(num);
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            disabled={subarrayConfig !== 20}
            label={t('numOf15mAntennas.short')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="numOf15mAntennas"
            value={numOf15mAntennas}
            setValue={validate}
            onFocus={() => helpComponent(t('numOf15mAntennas.help'))}
          />
        </Grid>
      </Grid>
    );
  };

  const NumOf13mAntennasField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (
        num >= Number(t('numOf13mAntennas.range.lower')) &&
        num <= Number(t('numOf13mAntennas.range.upper'))
      ) {
        setNumOf13mAntennas(num);
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            disabled={subarrayConfig !== 20}
            label={t('numOf13mAntennas.short')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="numOf13mAntennas"
            value={numOf13mAntennas}
            setValue={validate}
            onFocus={() => helpComponent(t('numOf13mAntennas.help'))}
          />
        </Grid>
      </Grid>
    );
  };

  const NumOfStationsField = () => {
    const validate = (e: number) => {
      const num = Number(Math.abs(e).toFixed(0));
      if (
        num >= Number(t('numOfStations.range.lower')) &&
        num <= Number(t('numOfStations.range.upper'))
      ) {
        setNumOfStations(num);
      }
    };

    return (
      <Grid pt={2} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            disabled={subarrayConfig !== 20}
            label={t('numOfStations.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="numOfStations"
            value={numOfStations}
            setValue={validate}
            onFocus={() => helpComponent(t('numOfStations.help'))}
          />
        </Grid>
      </Grid>
    );
  };

  const detailsField = () => (
    <TextEntry
      label={t('observationDetails.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      testId="observationDetails"
      value={details}
      setValue={setDetails}
      onFocus={() => helpComponent(t('observationDetails.help'))}
    />
  );

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const disabled = () => {
      // TODO : Extend so that all options are covered
      if (!elevation || !weather || !frequency || !effective) {
        return true;
      }
      return isContinuum() && !continuumBandwidth;
    };

    const addObservationToProposal = () => {
      const highestId = getProposal().observations?.reduce(
        (acc, observation) => (observation.id > acc ? observation.id : acc),
        0
      );
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      const newObservation = {
        id: highestId + 1,
        telescope: usedTelescope,
        subarray: subarrayConfig,
        linked: '0',
        type: observationType,
        observing_band: observingBand,
        weather: weather,
        elevation: elevation,
        central_frequency: frequency,
        bandwidth: bandwidth,
        spectral_averaging: spectralAveraging,
        tapering: tapering,
        image_weighting: imageWeighting,
        integration_time: suppliedValue,
        spectral_resolution: spectralResolution,
        effective_resolution: 0,
        number_of_sub_bands: subBands,
        number_of_13m_antennas: numOf13mAntennas,
        number_of_15m_antennas: numOf15mAntennas,
        number_of_stations: numOfStations,
        details: details
      };
      setProposal({
        ...getProposal(),
        observations: [...getProposal().observations, newObservation]
      });
    };

    const buttonClicked = () => {
      addObservationToProposal();
      navigate(NAV[5]);
    };

    return (
      <Paper
        sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
        elevation={0}
      >
        <Grid
          p={1}
          container
          direction="row"
          alignItems="space-between"
          justifyContent="space-between"
        >
          <Grid item />
          <Grid item />
          <Grid item>
            <Button
              ariaDescription="add Button"
              color={ButtonColorTypes.Secondary}
              disabled={disabled() + formInvalid}
              icon={getIcon()}
              label={t('button.add')}
              testId="addButton"
              onClick={buttonClicked}
              variant={ButtonVariantTypes.Contained}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner backPage={BACK_PAGE} pageNo={PAGE} />
      </Grid>

      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-evenly"
        justifyContent="space-around"
        spacing={1}
      >
        <Grid item xs={9}>
          <Grid
            container
            direction="row"
            alignItems="center"
            gap={1}
            spacing={1}
            paddingBottom={3}
            justifyContent="space-evenly"
          >
            <Grid item xs={XS_TOP}>
              {observingBandField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {arrayField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {subArrayField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {isLow() ? NumOfStationsField() : AntennasFields()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {elevationField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {weatherField()}
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
                  {observationTypeField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {suppliedField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {centralFrequencyField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {isContinuum() && continuumBandwidthField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {bandwidthField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {spectralResolutionField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {spectralAveragingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {effectiveResolutionField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {taperingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {SubBandsField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeightingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeighting === 2 && robustField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {detailsField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={3}>
          <HelpPanel />
        </Grid>
      </Grid>
      {pageFooter()}
    </Grid>
  );
}
