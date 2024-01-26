import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  Button,
  ButtonColorTypes,
  ButtonVariantTypes,
  DropDown,
  NumberEntry,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { NAV, OBSERVATION } from '../../utils/constants';
import HelpPanel from '../../components/helpPanel/helpPanel';
import { Proposal } from '../../services/types/proposal';

// TODO : Cypress Testing
// TODO : Documentation
// TODO : Improved validation
// TODO : Add functionality
// TODO : Combine Bandwidth & Spectral Resolution ( SensCalc )

const XS_TOP = 5;
const XS_BOTTOM = 5;
const PAGE = 9;

export const HELP_ARRAY = ['ARRAY TITLE', 'ARRAY DESCRIPTION', ''];
export const HELP_SUBARRAY = ['SUBARRAY TITLE', 'SUBARRAY DESCRIPTION', ''];
export const HELP_TYPE = ['TYPE TITLE', 'TYPE DESCRIPTION', ''];
export const HELP_BAND = ['BAND TITLE', 'BAND DESCRIPTION', ''];
export const HELP_ELEVATION = ['ELEVATION TITLE', 'ELEVATION DESCRIPTION', ''];
export const HELP_WEATHER = ['WEATHER TITLE', 'WEATHER DESCRIPTION', ''];
export const HELP_FREQUENCY = ['FREQUENCY TITLE', 'FREQUENCY DESCRIPTION', ''];
export const HELP_EFFECTIVE_RESOLUTION = [
  'EFFECTIVE RESOLUTION TITLE',
  'EFFECTIVE RESOLUTION DESCRIPTION',
  ''
];
export const HELP_IMAGE = ['IMAGE TITLE', 'IMAGE DESCRIPTION', ''];
export const HELP_TAPERING = ['TAPERING TITLE', 'TAPERING DESCRIPTION', ''];
export const HELP_BANDWIDTH = ['BANDWIDTH TITLE', 'BANDWIDTH DESCRIPTION', ''];
export const HELP_ROBUST = ['ROBUST TITLE', 'ROBUST DESCRIPTION', ''];
export const HELP_SPECTRAL_AVERAGING = [
  'SPECTRAL AVERAGING TITLE',
  'SPECTRAL AVERAGING DESCRIPTION',
  ''
];
export const HELP_SPECTRAL_RESOLUTION = [
  'SPECTRAL RESOLUTION TITLE',
  'SPECTRAL RESOLUTION DESCRIPTION',
  ''
];
export const HELP_SUPPLIED_TYPE = ['SUPPLIED TYPE TITLE', 'SUPPLIED TYPE DESCRIPTION', ''];
export const HELP_SUPPLIED_VALUE = ['SUPPLIED VALUE TITLE', 'SUPPLIED VALUE DESCRIPTION', ''];
export const HELP_SUPPLIED_UNITS = ['SUPPLIED UNITS TITLE', 'SUPPLIED UNITS DESCRIPTION', ''];
export const HELP_SENSE_VALUE = ['SENSE VALUE TITLE', 'SENSE VALUE DESCRIPTION', ''];
export const HELP_FREQUENCY_UNITS = ['FREQUENCY UNITS TITLE', 'FREQUENCY UNITS DESCRIPTION', ''];
export const HELP_CONTINUUM_BANDWIDTH = [
  'CONTINUUM BANDWIDTH TITLE',
  'CONTINUUM BANDWIDTH DESCRIPTION',
  ''
];
export const HELP_CONTINUUM_UNITS = ['CONTINUUM UNITS TITLE', 'CONTINUUM UNITS DESCRIPTION', ''];
export const HELP_SUB_BANDS = ['SUB-BANDS TITLE', 'SUB-BANDS DESCRIPTION', 'SUB-BANDS ADDITIONAL'];

export default function AddObservation() {
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [arrayConfig, setArrayConfig] = React.useState(1);
  const [subarrayConfig, setSubarrayConfig] = React.useState(1);
  const [observingBand, setObservingBand] = React.useState(1);
  const [observationType, setObservationType] = React.useState(1);
  const [elevation, setElevation] = React.useState('');
  const [weather, setWeather] = React.useState('');
  const [frequency, setFrequency] = React.useState('');
  const [effective, setEffective] = React.useState('');
  const [imageWeighting, setImageWeighting] = React.useState(1);
  const [tapering, setTapering] = React.useState(1);
  const [bandwidth, setBandwidth] = React.useState(1);
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

  React.useEffect(() => {
    helpComponent(HELP_ARRAY);
  }, []);

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
      onFocus={() => helpComponent(HELP_ARRAY)}
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
        onFocus={() => helpComponent(HELP_SUBARRAY)}
      />
    );
  };

  const arrayField = () => (
    <Grid spacing={1} container direction="row" alignItems="center" justifyContent="space-between">
      <Grid item xs={3} data-testid="arrayConfiguration">
        {arrayConfigurationField()}
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={7} data-testid="subarrayConfiguration">
        {subarrayConfigurationField()}
      </Grid>
    </Grid>
  );

  const observationTypeField = () => (
    <DropDown
      options={OBSERVATION.ObservationType}
      testId="observationType"
      value={observationType}
      setValue={setObservationType}
      label="Observation Type"
      onFocus={() => helpComponent(HELP_TYPE)}
    />
  );

  const observingBandField = () => {
    const getOptions = () => {
      if (OBSERVATION.array[arrayConfig - 1].band) {
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
        onFocus={() => helpComponent(HELP_BAND)}
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
      onFocus={() => helpComponent(HELP_IMAGE)}
    />
  );

  const taperingField = () => (
    <DropDown
      options={OBSERVATION.Tapering}
      testId="tapering"
      value={tapering}
      setValue={setTapering}
      label="tapering"
      onFocus={() => helpComponent(HELP_TAPERING)}
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
        onFocus={() => helpComponent(HELP_BANDWIDTH)}
      />
    );
  };

  const robustField = () => {
    const getOptions = () => {
      if (imageWeighting === 2) {
        return OBSERVATION.array[arrayConfig - 1].robust;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getOptions()}
        testId="robust"
        value={robust}
        setValue={setRobust}
        label="Robust"
        onFocus={() => helpComponent(HELP_ROBUST)}
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
        onFocus={() => helpComponent(HELP_SPECTRAL_RESOLUTION)}
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
        onFocus={() => helpComponent(HELP_SPECTRAL_AVERAGING)}
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
          onFocus={() => helpComponent(HELP_SUPPLIED_TYPE)}
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
          onFocus={() => helpComponent(HELP_SUPPLIED_UNITS)}
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
          onFocus={() => helpComponent(HELP_FREQUENCY_UNITS)}
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
          onFocus={() => helpComponent(HELP_CONTINUUM_UNITS)}
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
      onFocus={() => helpComponent(HELP_SUPPLIED_VALUE)}
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
      onFocus={() => helpComponent(HELP_ELEVATION)}
    />
  );

  const weatherField = () => (
    <TextEntry
      label="Weather"
      testId="weather"
      value={weather}
      setValue={setWeather}
      onFocus={() => helpComponent(HELP_WEATHER)}
    />
  );

  const frequencyField = () => (
    <TextEntry
      label="Central Frequency"
      testId="frequency"
      value={frequency}
      setValue={setFrequency}
      onFocus={() => helpComponent(HELP_FREQUENCY)}
    />
  );

  const subBandsField = () => {
    const [error, setError] = React.useState('');
    const validate = e => {
      if (e < 0 || e > 32) {
        setError('Value must be in the range 0 - 32 inclusive');
      } else {
        setError('');
      }
      setSubBands(e);
    };

    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {isContinuum() && (
          <NumberEntry
            label="Number of sub-bands"
            testId="subBands"
            value={subBands}
            setValue={validate}
            onFocus={() => helpComponent(HELP_SUB_BANDS)}
            errorText={error}
          />
        )}
      </>
    );
  };

  const continuumBandwidthValueField = () => (
    <TextEntry
      label="Continuum Bandwidth"
      testId="continuumBandwidth"
      value={continuumBandwidth}
      setValue={setContinuumBandwidth}
      onFocus={() => helpComponent(HELP_CONTINUUM_BANDWIDTH)}
    />
  );

  const effectiveResolutionField = () => (
    <TextEntry
      label="Effective Resolution"
      testId="effective"
      value={effective}
      setValue={setEffective}
      onFocus={() => helpComponent(HELP_EFFECTIVE_RESOLUTION)}
    />
  );

  const centralFrequencyField = () => (
    <Grid
      spacing={1}
      container
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      data-testid="centralFrequency"
    >
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

  const pageFooter = () => {
    const getIcon = () => <AddIcon />;

    const disabled = () => {
      // TODO : Extend so that all options are covered
      if (!elevation || !weather || !frequency || !effective) {
        return true;
      }
      if (isContinuum && !continuumBandwidth) {
        return true;
      }
      return false;
    };

    const addObservationToProposal = () => {
      const highestId = getProposal().observations.reduce(
        (acc, observation) => (observation.id > acc ? observation.id : acc),
        0
      );
      const newObservation = {
        id: highestId + 1,
        telescope: arrayConfig,
        subarray: subarrayConfig,
        linked: '0',
        type: observationType
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
              disabled={disabled()}
              icon={getIcon()}
              label="Add"
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
        <PageBanner pageNo={PAGE} />
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
            justifyContent="space-evenly"
          >
            <Grid item xs={XS_TOP}>
              {arrayField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {observingBandField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {elevationField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {weatherField()}
            </Grid>
            <Grid item xs={XS_TOP} />
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
                  {subBandsField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeightingField()}
                </Grid>
                <Grid item xs={XS_BOTTOM}>
                  {imageWeighting === 2 && robustField()}
                </Grid>
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
