import React from 'react';
import { useTranslation } from 'react-i18next';
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
import { env } from 'env';

// TODO : Cypress Testing
// TODO : Documentation
// TODO : Improved validation
// TODO : Add functionality
// TODO : Combine Bandwidth & Spectral Resolution ( SensCalc )

const XS_TOP = 5;
const XS_BOTTOM = 5;
const PAGE = 9;

export default function AddObservation() {
  const { t } = useTranslation('pht');
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
  const [suppliedValue, setSuppliedValue] = React.useState('');
  const [suppliedUnits, setSuppliedUnits] = React.useState(1);
  const [frequencyUnits, setFrequencyUnits] = React.useState(1);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState('');
  const [continuumUnits, setContinuumUnits] = React.useState(1);
  const [subBands, setSubBands] = React.useState(0);

  React.useEffect(() => {
    helpComponent(t('arrayConfiguration.help'));
  }, []);

  const checkConfiguration = (e: number) => {
    setArrayConfig(e);
    setSubarrayConfig(e > 0 ? 1 : 0);
  };

  const isContinuum = () => observationType === 1;

  const arrayConfigurationField = () => {
    const getArrayOptions = () => {
      if (arrayConfig) {
        const res = OBSERVATION.array.map(e => {
          return {
            label: t('arrayConfiguration.' + e.value),
            value: e.value
          };
        });
        return res;
      }
      return [{ label: '', value: 0 }];
    };

    return (
      <DropDown
        options={getArrayOptions()}
        testId="arrayConfig"
        value={arrayConfig}
        setValue={checkConfiguration}
        label={t('arrayConfiguration.label')}
        onFocus={() => helpComponent(t('arrayConfiguration.help'))}
      />
    );
  };

  const subarrayConfigurationField = () => {
    const getSubArrayOptions = () => {
      if (arrayConfig) {
        const res = OBSERVATION.array[arrayConfig - 1].subarray.map(e => {
          return {
            label: t('subArrayConfiguration.' + e.value),
            value: e.value
          };
        });
        return res;
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
        label={t('subArrayConfiguration.label')}
        onFocus={() => helpComponent(t('subArrayConfiguration.help'))}
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
      label={t('observationType.label')}
      onFocus={() => helpComponent(t('observationType.help'))}
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
        disabled={!getOptions() || getOptions()?.length < 2}
        testId="observingBand"
        value={observingBand}
        setValue={setObservingBand}
        label={t('label.observingBand')}
        onFocus={() => helpComponent(t('help.observingBand'))}
      />
    );
  };

  const imageWeightingField = () => (
    <DropDown
      options={OBSERVATION.ImageWeighting}
      testId="imageWeighting"
      value={imageWeighting}
      setValue={setImageWeighting}
      label={t('label.imageWeighting')}
      onFocus={() => helpComponent(t('help.imageWeighting'))}
    />
  );

  const taperingField = () => (
    <DropDown
      options={OBSERVATION.Tapering}
      testId="tapering"
      value={tapering}
      setValue={setTapering}
      label={t('label.tapering')}
      onFocus={() => helpComponent(t('help.tapering'))}
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
        label={t('label.bandWidth')}
        onFocus={() => helpComponent(t('help.bandWidth'))}
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
        label={t('label.robust')}
        onFocus={() => helpComponent(t('help.robust'))}
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
        label={t('label.spectralResolution')}
        onFocus={() => helpComponent(t('help.spectralResolution'))}
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
        label={t('label.spectralAveraging')}
        onFocus={() => helpComponent(t('help.spectralAveraging'))}
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
          onFocus={() => helpComponent(t('help.suppliedType'))}
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
          onFocus={() => helpComponent(t('help.suppliedUnits'))}
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
          onFocus={() => helpComponent(t('help.frequencyUnits'))}
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
          onFocus={() => helpComponent(t('help.continuumUnits'))}
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
      onFocus={() => helpComponent(t('help.suppliedValue'))}
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
      label={t('label.elevation')}
      testId="elevation"
      value={elevation}
      setValue={setElevation}
      onFocus={() => helpComponent(t('help.elevation'))}
    />
  );

  const weatherField = () => (
    <TextEntry
      label={t('label.weather')}
      testId="weather"
      value={weather}
      setValue={setWeather}
      onFocus={() => helpComponent(t('help.weather'))}
    />
  );

  const frequencyField = () => (
    <TextEntry
      label={t('label.centralFrequency')}
      testId="frequency"
      value={frequency}
      setValue={setFrequency}
      onFocus={() => helpComponent(t('help.centralFrequency'))}
    />
  );

  const SubBandsField = () => {
    const [error, setError] = React.useState('');
    const validate = e => {
      if (e < 0 || e > 32) {
        setError(t('error.subBandRange'));
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
            label={t('label.subBands')}
            testId="subBands"
            value={subBands}
            setValue={validate}
            onFocus={() => helpComponent(t('help.subBands'))}
            errorText={error}
          />
        )}
      </>
    );
  };

  const continuumBandwidthValueField = () => (
    <TextEntry
      label={t('label.continuumBandWidth')}
      testId="continuumBandwidth"
      value={continuumBandwidth}
      setValue={setContinuumBandwidth}
      onFocus={() => helpComponent(t('help.continuumBandWidth'))}
    />
  );

  const effectiveResolutionField = () => (
    <TextEntry
      label={t('label.effectiveResolution')}
      testId="effective"
      value={effective}
      setValue={setEffective}
      onFocus={() => helpComponent(t('help.effectiveResolution'))}
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
      if (isContinuum() && !continuumBandwidth) {
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
      navigate(env.REACT_APP_SKA_PHT_BASE_URL + NAV[5]);
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
                  {SubBandsField()}
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
