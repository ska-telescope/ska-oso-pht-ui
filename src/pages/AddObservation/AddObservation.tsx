import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid } from '@mui/material';
import { DropDown, NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import PageFooter from '../../components/layout/pageFooter/PageFooter';
import InfoPanel from '../../components/infoPanel/infoPanel';
import { DEFAULT_HELP, OBSERVATION } from '../../utils/constants';

const XS_TOP = 3; 
const XS_BOTTOM = 5; 

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
export const HELP_FREQUENCY_UNITS = {
  title: 'FREQUENCY UNITS TITLE',
  description: 'FREQUENCY UNITS DESCRIPTION',
  additional: ''
};
export const HELP_CONTINUUM_BANDWIDTH = {
  title: 'CONTINUUM BANDWIDTH TITLE',
  description: 'CONTINUUM BANDWIDTH DESCRIPTION',
  additional: ''
};
export const HELP_CONTINUUM_UNITS = {
  title: 'CONTINUUM UNITS TITLE',
  description: 'CONTINUUM UNITS DESCRIPTION',
  additional: ''
};
export const HELP_SUB_BANDS = {
  title: 'SUB-BANDS TITLE',
  description: 'SUB-BANDS DESCRIPTION',
  additional: 'SUB-BANDS ADDITIONAL'
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
  const [frequencyUnits, setFrequencyUnits] = React.useState(1);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState('');
  const [continuumUnits, setContinuumUnits] = React.useState(1);
  const [subBands, setSubBands] = React.useState(0);

  const [help, setHelp] = React.useState(DEFAULT_HELP);

  const addObservation = () => {
    navigate('/proposal');
  };

  const checkConfiguration = (e: number) => {
    setArrayConfig(e);
    setSubarrayConfig(e > 0 ? 1 : 0);
  };

  const isContinuum = () => observationType === 1;

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
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId="suppliedType"
          value={suppliedType}
          setValue={setSuppliedType}
          label=""
          onFocus={() => setHelp(HELP_SUPPLIED_TYPE)}
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
          onFocus={() => setHelp(HELP_SUPPLIED_UNITS)}
        />
      </Box>
    );
  };

  const frequencyUnitsField = () => {
    const getOptions = () => OBSERVATION.Units;

    return (
      <Box pt={3}>
        <DropDown
          options={getOptions()}
          testId="frequencyUnits"
          value={frequencyUnits}
          setValue={setFrequencyUnits}
          label=""
          onFocus={() => setHelp(HELP_FREQUENCY_UNITS)}
        />
      </Box>
    );
  };

  const continuumUnitsField = () => {
    const getOptions = () => OBSERVATION.Units;

    return (
      <Box pt={3}>
        <DropDown
          options={getOptions()}
          testId="continuumUnits"
          value={continuumUnits}
          setValue={setContinuumUnits}
          label=""
          onFocus={() => setHelp(HELP_CONTINUUM_UNITS)}
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
      onFocus={() => setHelp(HELP_SUPPLIED_VALUE)}
    />
  );

  const suppliedField = () => (
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
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
  );

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

  const subBandsField = () => (
    <NumberEntry
      label="Number of sub-bands"
      testId="subBands"
      value={subBands}
      setValue={setSubBands}
      onFocus={() => setHelp(HELP_SUB_BANDS)}
    />
  );

  const continuumBandwidthValueField = () => (
    <TextEntry
      label="Continuum Bandwidth"
      testId="continuumBandwidth"
      value={continuumBandwidth}
      setValue={setContinuumBandwidth}
      onFocus={() => setHelp(HELP_CONTINUUM_BANDWIDTH)}
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
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={8}>
        {frequencyField()}
      </Grid>
      <Grid item xs={4}>
        {frequencyUnitsField()}
      </Grid>
    </Grid>
  );

  const continuumBandwidthField = () => (
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={8}>
        {continuumBandwidthValueField()}
      </Grid>
      <Grid item xs={4}>
        {continuumUnitsField()}
      </Grid>
    </Grid>
  );

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
          <Grid container direction="row" alignItems="center" gap={1} spacing={1} justifyContent="space-evenly">
            <Grid item xs={XS_TOP}>
              {arrayConfigurationField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {observingBandField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {elevationField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {subarrayConfigurationField()}
            </Grid>
            <Grid item xs={XS_TOP} />
            <Grid item xs={XS_TOP}>
              {weatherField()}
            </Grid>
          </Grid>
          <Card variant="outlined">
            <CardContent>
              <Grid container direction="row" alignItems="center" gap={1} justifyContent="space-evenly">
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
                  {imageWeightingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {robustField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {isContinuum() && subBandsField()}
                </Grid>
              </Grid>
            </CardContent>
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
