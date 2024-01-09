import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Grid } from '@mui/material';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import InfoPanel from '../../components/infoPanel/infoPanel';
import { DEFAULT_HELP, OBSERVATION } from '../../utils/constants';

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
export const HELP_EFFECTIVE_RESOLUTION = {
  title: 'EFFECTIVE RESOLUTION TITLE',
  description: 'EFFECTIVE RESOLUTION DESCRIPTION',
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
export const HELP_SPECTRAL_AVERAGING = {
  title: 'SPECTRAL AVERAGING TITLE',
  description: 'SPECTRAL AVERAGING DESCRIPTION',
  additional: ''
};
export const HELP_SPECTRAL_RESOLUTION = {
  title: 'SPECTRAL RESOLUTION TITLE',
  description: 'SPECTRAL RESOLUTION DESCRIPTION',
  additional: ''
};
export const HELP_SUPPLIED_TYPE = {
  title: 'SUPPLIED TYPE TITLE',
  description: 'SUPPLIED TYPE DESCRIPTION',
  additional: ''
};
export const HELP_SUPPLIED_VALUE = {
  title: 'SUPPLIED VALUE TITLE',
  description: 'SUPPLIED VALUE DESCRIPTION',
  additional: ''
};
export const HELP_SUPPLIED_UNITS = {
  title: 'SUPPLIED UNITS TITLE',
  description: 'SUPPLIED UNITS DESCRIPTION',
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

  const [arrayConfig, setArrayConfig] = React.useState(0);
  const [subarrayConfig, setSubarrayConfig] = React.useState(0);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(0);
  const [elevation, setElevation] = React.useState('');
  const [weather, setWeather] = React.useState('');
  const [frequency, setFrequency] = React.useState('');
  const [effective, setEffective] = React.useState('');
  const [imageWeighting, setImageWeighting] = React.useState(0);
  const [tapering, setTapering] = React.useState(0);
  const [bandwidth, setBandwidth] = React.useState(0);
  const [robust, setRobust] = React.useState(0);
  const [spectralAveraging, setSpectralAveraging] = React.useState(1);
  const [spectralResolution, setSpectralResolution] = React.useState(1);
  const [suppliedType, setSuppliedType] = React.useState(1);
  const [suppliedValue, setSuppliedValue] = React.useState();
  const [suppliedUnits, setSuppliedUnits] = React.useState(1);
  const [units, setUnits] = React.useState(1);

  const [help, setHelp] = React.useState(DEFAULT_HELP);

  const addObservation = () => {
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
      if (arrayConfig) {
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
    const getOptions = () => {
      if (arrayConfig && imageWeighting === 2) {
        return OBSERVATION.array[arrayConfig - 1].robust;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getOptions()}
        disabled={!arrayConfig || imageWeighting !== 2}
        testId="robust"
        value={robust}
        setValue={setRobust}
        label="Robust"
        onFocus={() => setHelp(HELP_ROBUST)}
      />
    );
  };

  const spectralResolutionField = () => {
    const getOptions = () => {
    if (arrayConfig) {
      return OBSERVATION.array[arrayConfig - 1].spectralResolution;
    }
    return [{ label: '', value: 0 }];
  };

    return (
      <DropDown
        options={getOptions()}
        testId="spectralResolution"
        value={spectralResolution}
        setValue={setSpectralResolution}
        label="Spectral Resolution"
        onFocus={() => setHelp(HELP_SPECTRAL_RESOLUTION)}
      />
    );
  };

  const spectralAveragingField = () => {
    const getOptions = () => OBSERVATION.SpectralAveraging;

    return (
      <DropDown
        options={getOptions()}
        testId="spectral"
        value={spectralAveraging}
        setValue={setSpectralAveraging}
        label="Spectral Averaging"
        onFocus={() => setHelp(HELP_SPECTRAL_AVERAGING)}
      />
    );
  };

  const suppliedTypeField = () => {
    const getOptions = () => OBSERVATION.Supplied;

    return (
      <DropDown
        options={getOptions()}
        testId="suppliedType"
        value={suppliedType}
        setValue={setSuppliedType}
        label=""
        onFocus={() => setHelp(HELP_SUPPLIED_TYPE)}
      />
    );
  };

  const suppliedUnitsField = () => {
    const getOptions = () =>  OBSERVATION.Supplied[suppliedType - 1].units;

    return (
      <DropDown
        options={getOptions()}
        testId="suppliedUnits"
        value={suppliedUnits}
        setValue={setSuppliedUnits}
        label=""
        onFocus={() => setHelp(HELP_SUPPLIED_UNITS)}
      />
    );
  };

  const unitsField = () => {
    const getOptions = () => OBSERVATION.Units;

    return (
      <DropDown
        options={getOptions()}
        testId="units2"
        value={units}
        setValue={setUnits}
        label=""
        onFocus={() => setHelp(HELP_UNITS)}
      />
    );
  };

  const suppliedValueField = () => (
    <TextEntry
      label=""
      testId="suppliedValue"
      value={suppliedValue}
      setValue={setSuppliedValue}
      onFocus={() => setHelp(HELP_SUPPLIED_VALUE)}
    />
  );

  const suppliedField = () => (
    <Grid
      gap={0}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Grid item xs={4}>
        {suppliedTypeField()}
      </Grid>
      <Grid item xs={5}>
        {suppliedValueField()}
      </Grid>
      <Grid item xs={3}>
        {suppliedUnitsField()}
      </Grid>
    </Grid>
)

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

  const effectiveResolutionField = () => (
    <TextEntry
      label="Effective Resolution"
      testId="effective"
      value={effective}
      setValue={setEffective}
      onFocus={() => setHelp(HELP_EFFECTIVE_RESOLUTION)}
    />
  );

  const centralFrequencyField = () => (
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
        {unitsField()}
      </Grid>
    </Grid>
)

  const helpPanel = () => (
    <InfoPanel title={help.title} description={help.description} additional={help.additional} />
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
          <Card variant="outlined">
            <Grid
              gap={1}
              spacing={1}
              container
              direction="row"
              alignItems="center"
              justifyContent="space-evenly"
            >
              <Grid item xs={5}>
                {observationTypeField()}
                {suppliedField()}
                {centralFrequencyField()}
                {bandwidthField()}
                {spectralResolutionField()}
                {spectralAveragingField()}
                {effectiveResolutionField()}
              </Grid>
              <Grid item xs={5}>
                {taperingField()}
                {imageWeightingField()}
                {robustField()}
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs={3}>
          {helpPanel()}
        </Grid>
      </Grid>
      <PageFooter pageNo={-2} buttonFunc={addObservation} />
    </Grid>
  );
}
