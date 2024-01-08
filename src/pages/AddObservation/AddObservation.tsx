import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import InfoPanel from '../../components/infoPanel/infoPanel';
import { DEFAULT_HELP, OBSERVATION } from '../../utils/constants';
import SensCalcButton from '../../components/button/SensCalc/SensCalcButton';

export const HELP_ARRAY = {
  title: 'ARRAY TITLE',
  description: 'ARRAY DESCRIPTION',
  additional: ''
};
export const HELP_SUBARRAY = {
  title: 'SUBARRAY TITLE',
  description: 'SUBARRAY DESCRIPTION',
  additional: ''
};
export const HELP_TYPE = {
  title: 'TYPE TITLE',
  description: 'TYPE DESCRIPTION',
  additional: ''
};
export const HELP_BAND = {
  title: 'BAND TITLE',
  description: 'BAND DESCRIPTION',
  additional: ''
};
export const HELP_ELEVATION = {
  title: 'ELEVATION TITLE',
  description: 'ELEVATION DESCRIPTION',
  additional: ''
};
export const HELP_WEATHER = {
  title: 'WEATHER TITLE',
  description: 'WEATHER DESCRIPTION',
  additional: ''
};
export const HELP_FREQUENCY = {
  title: 'FREQUENCY TITLE',
  description: 'FREQUENCY DESCRIPTION',
  additional: ''
};
export const HELP_IMAGE = {
  title: 'IMAGE TITLE',
  description: 'IMAGE DESCRIPTION',
  additional: ''
};
export const HELP_TAPERING = {
  title: 'TAPERING TITLE',
  description: 'TAPERING DESCRIPTION',
  additional: ''
};
export const HELP_BANDWIDTH = {
  title: 'BANDWIDTH TITLE',
  description: 'BANDWIDTH DESCRIPTION',
  additional: ''
};
export const HELP_ROBUST = {
  title: 'ROBUST TITLE',
  description: 'ROBUST DESCRIPTION',
  additional: ''
};
export const HELP_SPECTRAL = {
  title: 'SPECTRAL TITLE',
  description: 'SPECTRAL DESCRIPTION',
  additional: ''
};
export const HELP_SUPPLIED = {
  title: 'SUPPLIED TITLE',
  description: 'SUPPLIED DESCRIPTION',
  additional: ''
};
export const HELP_SENSE_VALUE = {
  title: 'SENSE VALUE TITLE',
  description: 'SENSE VALUE DESCRIPTION',
  additional: ''
};
export const HELP_UNITS = {
  title: 'UNITS TITLE',
  description: 'UNITS DESCRIPTION',
  additional: ''
};

export default function AddObservation() {
  const navigate = useNavigate();

  const [arrayConfig, setArrayConfig] = React.useState(1);
  const [subarrayConfig, setSubarrayConfig] = React.useState(1);
  const [observingBand, setObservingBand] = React.useState(1);
  const [observationType, setObservationType] = React.useState(0);
  const [elevation, setElevation] = React.useState('');
  const [weather, setWeather] = React.useState('');
  const [frequency, setFrequency] = React.useState('');
  const [imageWeighting, setImageWeighting] = React.useState(0);
  const [tapering, setTapering] = React.useState(0);
  const [bandwidth, setBandwidth] = React.useState(0);
  const [robust, setRobust] = React.useState(0);
  const [spectral, setSpectral] = React.useState(0);
  const [supplied, setSupplied] = React.useState(0);
  const [senseValue, setSenseValue] = React.useState();
  const [units1, setUnits1] = React.useState(0);
  const [units2, setUnits2] = React.useState(0);

  const [help, setHelp] = React.useState(DEFAULT_HELP);

  const createProposal = () => {
    // TODO : We need to call putProposal here.

    navigate('/proposal');
  };

  const checkConfiguration = (e: number) => {
    setArrayConfig(e);
    setSubarrayConfig(e > 0 ? 1 : 0);
  };

  const arrayConfigurationField = () => (
    <DropDown
      options={OBSERVATION.array}
      testId="arrayConfig"
      value={arrayConfig}
      setValue={checkConfiguration}
      label="Array Configuration"
      onFocus={() => setHelp(HELP_ARRAY)}
    />
  );

  const subarrayConfigurationField = () => {
    const getSubArrayOptions = () => {
      if (arrayConfig) {
        return OBSERVATION.array[arrayConfig - 1].subarray;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getSubArrayOptions()}
        disabled={!arrayConfig || OBSERVATION.array[arrayConfig - 1].subarray.length < 2}
        testId="subarrayConfig"
        value={subarrayConfig}
        setValue={setSubarrayConfig}
        label="Subarray Configuration"
        onFocus={() => setHelp(HELP_SUBARRAY)}
      />
    );
  };

  const observationTypeField = () => (
    <DropDown
      options={OBSERVATION.ObservationType}
      testId="observationType"
      value={observationType}
      setValue={setObservationType}
      label="Observation Type"
      onFocus={() => setHelp(HELP_TYPE)}
    />
  );

  const observingBandField = () => {
    const getOptions = () => {
      if (arrayConfig && OBSERVATION.array[arrayConfig - 1].band) {
        return OBSERVATION.array[arrayConfig - 1].band;
      }
      return [{ label: 'Not applicable', value: 0 }];
    };
    return (
      <DropDown
        options={getOptions()}
        disabled={getOptions().length < 2}
        testId="observingBand"
        value={observingBand}
        setValue={setObservingBand}
        label="Observing Band"
        onFocus={() => setHelp(HELP_BAND)}
      />
    );
  };

  const imageWeightingField = () => (
    <DropDown
      options={OBSERVATION.ImageWeighting}
      testId="imageWeighting"
      value={imageWeighting}
      setValue={setImageWeighting}
      label="Image Weighting"
      onFocus={() => setHelp(HELP_IMAGE)}
    />
  );

  const taperingField = () => (
    <DropDown
      options={OBSERVATION.Tapering}
      testId="tapering"
      value={tapering}
      setValue={setTapering}
      label="tapering"
      onFocus={() => setHelp(HELP_TAPERING)}
    />
  );

  const bandwidthField = () => {
    const getOptions = () => {
      if (arrayConfig && OBSERVATION.array[arrayConfig - 1].bandWidth) {
        return OBSERVATION.array[arrayConfig - 1].bandWidth;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getOptions()}
        testId="bandwidth"
        value={bandwidth}
        setValue={setBandwidth}
        label="Bandwidth"
        onFocus={() => setHelp(HELP_BANDWIDTH)}
      />
    );
  };

  const robustField = () => {
    const getOptions = () => OBSERVATION.ImageWeighting[imageWeighting].robust;

    return (
      <DropDown
        options={getOptions()}
        testId="robust"
        value={robust}
        setValue={setRobust}
        label="Robust"
        onFocus={() => setHelp(HELP_ROBUST)}
      />
    );
  };

  const spectralField = () => {
    const getOptions = () => {
      if (arrayConfig) {
        return OBSERVATION.array[arrayConfig - 1].spectralAveraging;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getOptions()}
        testId="spectral"
        value={spectral}
        setValue={setSpectral}
        label="Spectral Averaging"
        onFocus={() => setHelp(HELP_SPECTRAL)}
      />
    );
  };

  const suppliedField = () => {
    const getOptions = () => OBSERVATION.Supplied;

    return (
      <DropDown
        options={getOptions()}
        testId="supplied"
        value={supplied}
        setValue={setSupplied}
        label=""
        onFocus={() => setHelp(HELP_SUPPLIED)}
      />
    );
  };

  const units1Field = () => {
    const getOptions = () => OBSERVATION.Supplied[supplied].units;

    return (
      <DropDown
        options={getOptions()}
        testId="units1"
        value={units1}
        setValue={setUnits1}
        label=""
        onFocus={() => setHelp(HELP_UNITS)}
      />
    );
  };

  const units2Field = () => {
    const getOptions = () => OBSERVATION.Units;
    // TODO : TO BE DEFINED CORRECTLY

    return (
      <DropDown
        options={getOptions()}
        testId="units2"
        value={units2}
        setValue={setUnits2}
        label=""
        onFocus={() => setHelp(HELP_UNITS)}
      />
    );
  };

  const elevationField = () => (
    <TextEntry
      label="Elevation"
      testId="elevation"
      value={elevation}
      setValue={setElevation}
      onFocus={() => setHelp(HELP_ELEVATION)}
    />
  );

  const weatherField = () => (
    <TextEntry
      label="Weather"
      testId="weather"
      value={weather}
      setValue={setWeather}
      onFocus={() => setHelp(HELP_WEATHER)}
    />
  );

  const frequencyField = () => (
    <TextEntry
      label="Central Frequency"
      testId="frequency"
      value={frequency}
      setValue={setFrequency}
      onFocus={() => setHelp(HELP_FREQUENCY)}
    />
  );

  const senseValueField = () => (
    <TextEntry
      label=""
      testId="senseValue"
      value={senseValue}
      setValue={setSenseValue}
      onFocus={() => setHelp(HELP_SENSE_VALUE)}
    />
  );

  const helpPanel = () => (
    <InfoPanel title={help.title} description={help.description} additional={help.additional} />
  );

  const sensCalcPanel = () => (
    <Grid
      sx={{ border: '1px solid grey' }}
      container
      direction="column"
      alignItems="center"
      justifyContent="space-evenly"
    >
      <Grid item>
        <Typography sx={{ fontWeight: 'bold' }} m={1} variant="subtitle2">
          Sensitivity Calculator
        </Typography>
      </Grid>
      <Grid item>
        <Typography m={1} variant="body2">
          Area where information about the calculator is displayed and also any notifications or
          errors after running the calculator
        </Typography>
      </Grid>
      <Grid m={1} item>
        <SensCalcButton />
      </Grid>
    </Grid>
  );

  return (
    <Grid container direction="column" alignItems="space-evenly" justifyContent="space-around">
      <Grid item>
        <PageBanner proposalState={null} title="Add Observation" addPage={0} />
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
          <Grid container direction="row" alignItems="center" justifyContent="space-evenly">
            <Grid item xs={3}>
              {arrayConfigurationField()}
              {subarrayConfigurationField()}
            </Grid>
            <Grid item xs={3}>
              {observingBandField()}
            </Grid>
            <Grid item xs={3}>
              {elevationField()}
              {weatherField()}
            </Grid>
          </Grid>
          <Grid
            gap={1}
            spacing={1}
            sx={{ border: '1px solid grey' }}
            container
            direction="row"
            alignItems="center"
            justifyContent="space-evenly"
          >
            <Grid item xs={5}>
              {observationTypeField()}
              <Grid
                gap={0}
                container
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item xs={8}>
                  {frequencyField()}
                </Grid>
                <Grid item xs={4}>
                  {units2Field()}
                </Grid>
              </Grid>
              {imageWeightingField()}
              {robustField()}
            </Grid>
            <Grid item xs={5}>
              <Grid
                gap={0}
                container
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Grid item xs={4}>
                  {suppliedField()}
                </Grid>
                <Grid item xs={5}>
                  {senseValueField()}
                </Grid>
                <Grid item xs={3}>
                  {units1Field()}
                </Grid>
              </Grid>
              {taperingField()}
              {bandwidthField()}
              {spectralField()}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}>
          {helpPanel()}
          {sensCalcPanel()}
        </Grid>
      </Grid>
      <PageFooter pageNo={-1} buttonFunc={createProposal} />
    </Grid>
  );
}
