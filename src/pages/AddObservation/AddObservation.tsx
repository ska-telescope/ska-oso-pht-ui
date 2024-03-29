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
  LABEL_POSITION,
  NumberEntry,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import { BANDWIDTH_TELESCOPE, NAV, OBSERVATION } from '../../utils/constants';
import HelpPanel from '../../components/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';

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

  // TODO: implement stricter validations for the fields to ensure successful requests to the Sensitivity Calculator API (type and range of values)
  // some unit conversion will also be useful

  React.useEffect(() => {
    helpComponent(t('observingBand.help'));
  }, []);

  const isContinuum = () => observationType === 1;

  const arrayField = () => {
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

  const elevationField = () => (
    <TextEntry
      label={t('elevation.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      testId="elevation"
      value={elevation}
      setValue={setElevation}
      onFocus={() => helpComponent(t('elevation.help'))}
      required
    />
  );

  const weatherField = () => (
    <TextEntry
      label={t('weather.label')}
      labelBold
      labelPosition={LABEL_POSITION.START}
      labelWidth={LABEL_WIDTH_STD}
      testId="weather"
      value={weather}
      setValue={setWeather}
      onFocus={() => helpComponent(t('weather.help'))}
      required
    />
  );

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
    />
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
        number_of_sub_bands: subBands
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
            justifyContent="space-evenly"
          >
            <Grid item xs={XS_TOP}>
              {observingBandField()}
            </Grid>
            <Grid item xs={XS_TOP}>
              {arrayField()}
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
