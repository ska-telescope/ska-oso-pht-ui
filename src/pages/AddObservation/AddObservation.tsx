import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DropDown,
  LABEL_POSITION,
  NumberEntry,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import {
  BANDWIDTH_TELESCOPE,
  NAV,
  OBSERVATION,
  OBSERVATION_TYPE,
  TELESCOPE_LOW_NUM,
  TELESCOPES,
  TYPE_CONTINUUM
} from '../../utils/constants';
import HelpPanel from '../../components/info/helpPanel/helpPanel';
import Proposal from '../../utils/types/proposal';
import { generateId } from '../../utils/helpers';
import AddButton from '../../components/button/Add/Add';
import GroupObservation from '../../utils/types/groupObservation';

const XS_TOP = 5;
const XS_BOTTOM = 5;
const PAGE = 10;
const BACK_PAGE = 5;
const LINE_OFFSET = 30;

const LABEL_WIDTH_SELECT = 5;
const LABEL_WIDTH_STD = 5;
const LABEL_WIDTH_OPT1 = 6;

const FIELD_WIDTH_OPT1 = 10;
const FIELD_WIDTH_BUTTON = 2;

export default function AddObservation() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(8);
  const [subarrayConfigBand5, setSubarrayConfigBand5] = React.useState(9);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(1);
  const [elevation, setElevation] = React.useState(Number(t('elevation.default')));
  const [weather, setWeather] = React.useState(Number(t('weather.default')));
  const [frequency, setFrequency] = React.useState('');
  const [effective, setEffective] = React.useState('');
  const [imageWeighting, setImageWeighting] = React.useState(1);
  const [tapering, setTapering] = React.useState(1);
  const [bandwidth, setBandwidth] = React.useState(1);
  const [robust, setRobust] = React.useState(0);
  const [spectralAveraging, setSpectralAveraging] = React.useState(1);
  const [spectralResolution, setSpectralResolution] = React.useState('');
  const [suppliedType, setSuppliedType] = React.useState(1);
  const [suppliedValue, setSuppliedValue] = React.useState(Number(t('suppliedValue.default')));
  const [suppliedUnits, setSuppliedUnits] = React.useState(4);
  const [frequencyUnits, setFrequencyUnits] = React.useState(1);
  const [continuumBandwidth, setContinuumBandwidth] = React.useState(0);
  const [continuumUnits, setContinuumUnits] = React.useState(1);
  const [subBands, setSubBands] = React.useState(1);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState(1);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState(
    Number(t('numOf13_5mAntennas.range.subArrayAA0.5'))
  );
  const [numOfStations, setNumOfStations] = React.useState(0);
  const [details, setDetails] = React.useState('');
  const [validateToggle, setValidateToggle] = React.useState(false);

  const [groupObservation, setGroupObservation] = React.useState(0);
  const [groupObservationId, setGroupObservationId] = React.useState(null);
  const [addGroupObsDisabled, setAddGroupObsDisabled] = React.useState(false);
  const [newGroupObservationLabel, setGroupObservationLabel] = React.useState('');
  const [myObsId, setMyObsId] = React.useState('');
  const [selectedGroupObservation, setSelectedGroupObservation] = React.useState(null);

  React.useEffect(() => {
    const newId = generateId(t('addObservation.idPrefix'), 6);
    setMyObsId(newId);
  }, []);

  React.useEffect(() => {
    if (!groupObservationId) {
      setGroupObservationLabel(t('groupObservations.new'));
    } else {
      setGroupObservationLabel(groupObservationId);
      setAddGroupObsDisabled(true);
    }
  }, groupObservationId);

  React.useEffect(() => {
    if (!observingBand || !subarrayConfig) {
      const telescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      if (telescope > 0) {
        const record = OBSERVATION.array[telescope - 1].subarray.find(
          element => element.value === subarrayConfig
        );
        if (record) {
          setNumOf15mAntennas(record.numOf15mAntennas);
          setNumOf13mAntennas(record.numOf13mAntennas);
          setNumOfStations(record.numOfStations);
        }
      }
    }
  }, [subarrayConfig, observingBand]);

  // TODO : Dirty fix
  React.useEffect(() => {
    setValidateToggle(!validateToggle);
  }, [
    groupObservation,
    subarrayConfig,
    observationType,
    elevation,
    weather,
    effective,
    imageWeighting,
    tapering,
    bandwidth,
    robust,
    spectralResolution,
    suppliedType,
    suppliedValue,
    suppliedUnits,
    frequencyUnits,
    continuumBandwidth,
    continuumUnits,
    subBands,
    numOf15mAntennas,
    numOf13mAntennas,
    numOfStations,
    details
  ]);

  React.useEffect(() => {
    helpComponent(t('observingBand.help'));
  }, []);

  React.useEffect(() => {
    let centralFrequency;
    let continuumBandwidth;

    // HERE
    if (observingBand === 0) {
      console.log('observationType', observationType);
      setFrequency(OBSERVATION.CentralFrequencyOBLow[0].value);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOBLow.find(
        e => e.lookup === subarrayConfig
      );
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      setSpectralResolution(
        observationType === 1
          ? OBSERVATION.SpectralResolutionObLow[0].value
          : OBSERVATION.SpectralResolutionObLowZoom[0].value
      );
    }
    if (observingBand === 1) {
      centralFrequency = OBSERVATION.CentralFrequencyOB1.find(e => e.lookup === subarrayConfig);
      const valueCentralFrequency = centralFrequency?.value;
      setFrequency(valueCentralFrequency);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOB1.find(e => e.lookup === subarrayConfig);
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      const spectralResolutionKey =
        observationType === 1 ? 'SpectralResolutionOb1' : 'SpectralResolutionOb1Zoom';
      const spectralResolution = OBSERVATION[`${spectralResolutionKey}`].find(
        e => e.lookup === valueCentralFrequency
      );
      setSpectralResolution(spectralResolution?.value);
    }
    if (observingBand === 2) {
      centralFrequency = OBSERVATION.CentralFrequencyOB2.find(e => e.lookup === subarrayConfig);
      const valueCentralFrequency = centralFrequency?.value;
      setFrequency(valueCentralFrequency);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOB2.find(e => e.lookup === subarrayConfig);
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      const spectralResolutionKey =
        observationType === 1 ? 'SpectralResolutionOb2' : 'SpectralResolutionOb2Zoom';
      const spectralResolution = OBSERVATION[`${spectralResolutionKey}`].find(
        e => e.lookup === valueCentralFrequency
      );
      setSpectralResolution(spectralResolution?.value);
    }
    if (observingBand === 3) {
      // Band 5a
      setFrequency(OBSERVATION.CentralFrequencyOB5a[0].value);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOB5a.find(
        e => e.lookup === subarrayConfig
      );
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      setSpectralResolution(
        observationType === 1
          ? OBSERVATION.SpectralResolutionOb5a[0].value
          : OBSERVATION.SpectralResolutionOb5aZoom[0].value
      );
    }
    if (observingBand === 4) {
      // Band 5b
      setFrequency(OBSERVATION.CentralFrequencyOB5b[0].value);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOB5b.find(
        e => e.lookup === subarrayConfig
      );
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      setSpectralResolution(
        observationType === 1
          ? OBSERVATION.SpectralResolutionOb5b[0].value
          : OBSERVATION.SpectralResolutionOb5bZoom[0].value
      );
    }
  }, [observingBand, subarrayConfig, observationType]);

  const isContinuum = () => observationType === TYPE_CONTINUUM;
  const isLow = () => observingBand === 0;

  const isBand5 = () => BANDWIDTH_TELESCOPE[observingBand].isBand5;

  const isContinuumOnly = () => {
    if (isLow()) {
      if (subarrayConfig === 1 || subarrayConfig === 2) {
        return true;
      }
    } else {
      if (subarrayConfig === 1 || subarrayConfig === 2 || subarrayConfig === 3) {
        return true;
      }
    }
  };

  // TODO : We should move this to a utility at some point
  const options = (prefix: string, arr: number[]) => {
    let results = [];
    arr.forEach(element => {
      results.push({ label: t(prefix + '.' + element), value: element });
    });
    return results;
  };
  const hasGroupObservations = (): boolean => getProposal()?.groupObservations?.length > 0;

  const buttonGroupObservationsField = () => {
    const generateGroupId = () => {
      if (hasGroupObservations()) {
        // get latest group id and add + 1
        const groups = getProposal().groupObservations;
        const lastGroup = groups[groups.length - 1];
        const lastGroupId: number = parseInt(lastGroup.groupId.match(/-(\d+)/)[1]);
        return `${t('groupObservations.idPrefix')}${lastGroupId + 1}`;
      } else {
        return `${t('groupObservations.idPrefix')}1`;
      }
    };

    const buttonClicked = groupObservationValue => {
      switch (groupObservationValue) {
        case 0: // null
          break;
        case 1: // new group
          const newGroupObs: GroupObservation = {
            groupId: generateGroupId(),
            observationId: myObsId
          };
          setGroupObservationId(newGroupObs.groupId); // to display new ID in dropdown
          setSelectedGroupObservation(newGroupObs);
          break;
        default:
          // existing group
          const existingGroup: GroupObservation = {
            groupId: groupObservationValue,
            observationId: myObsId
          };
          setGroupObservationId(groupObservationValue);
          setSelectedGroupObservation(existingGroup);
      }
    };

    return (
      <Box pb={3}>
        <AddButton
          action={() => buttonClicked(groupObservation)}
          disabled={addGroupObsDisabled}
          testId="addGroupButton"
          toolTip="groupObservations.toolTip"
        />
      </Box>
    );
  };

  const groupObservationsField = () => {
    const getOptions = () => {
      const groups: GroupObservation[] = hasGroupObservations()
        ? getProposal()?.groupObservations
        : [];

      // don't display duplicate groupIds
      const uniqueGroups = groups.reduce((acc, group) => {
        const existingGroup = acc.find(g => g.groupId === group.groupId);
        if (!existingGroup) {
          acc.push(group);
        }
        return acc;
      }, []);

      const formattedGroupObs = [
        { label: t('groupObservations.none'), value: 0 },
        { label: newGroupObservationLabel, value: 1 },
        ...uniqueGroups.map(group => ({ label: group?.groupId, value: group?.groupId ?? 0 }))
      ];
      return formattedGroupObs as any;
    };

    return (
      <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getOptions()}
            testId="groupObservations"
            value={groupObservation}
            setValue={setGroupObservation}
            label={t('groupObservations.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('groupObservations.help'))}
            disabled={groupObservationId}
          />
        </Grid>
        <Grid pl={1} item xs={FIELD_WIDTH_BUTTON}>
          {buttonGroupObservationsField()}
        </Grid>
      </Grid>
    );
  };

  const subArrayFieldBand5 = () => {
    const getSubArrayOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      let subArrayOption = OBSERVATION.array[usedTelescope - 1].subarray;
      if (usedTelescope > 0) {
        if (isBand5) subArrayOption = subArrayOption.filter(e => !e.disableForBand5);
        return subArrayOption.map(e => {
          return {
            label: t('subArrayConfiguration.' + e.value),
            value: e.value
          };
        });
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <DropDown
            options={getSubArrayOptions()}
            testId="subarrayConfig"
            value={subarrayConfigBand5}
            setValue={setSubarrayConfigBand5}
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
  const subArrayField = () => {
    const getSubArrayOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      const isBand5 = BANDWIDTH_TELESCOPE[observingBand].isBand5;
      let subArrayOption = OBSERVATION.array[usedTelescope - 1].subarray;
      if (usedTelescope > 0) {
        if (isBand5) subArrayOption = subArrayOption.filter(e => !e.disableForBand5);
        return subArrayOption.map(e => {
          return {
            label: t('subArrayConfiguration.' + e.value),
            value: e.value
          };
        });
      }
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
          options={options('observationType', OBSERVATION_TYPE)}
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

  const observationTypeFieldContinuumOnly = () => (
    <Grid pt={1} spacing={0} container direction="row">
      <Grid item xs={FIELD_WIDTH_OPT1}>
        <DropDown
          options={options(
            'observationType',
            OBSERVATION_TYPE.filter(e => e === TYPE_CONTINUUM)
          )}
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
    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <TextEntry
            testId="spectralResolution"
            value={spectralResolution}
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
    const errorMessage = () => {
      const min = Number(t('spectralAveraging.range.lower'));
      const max = Number(t('spectralAveraging.range.upper'));
      return spectralAveraging < min || spectralAveraging > max
        ? t('spectralAveraging.range.error')
        : '';
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            testId="spectral"
            value={String(spectralAveraging)}
            setValue={setSpectralAveraging}
            label={t('spectralAveraging.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t('spectralAveraging.help'))}
            required
            errorText={errorMessage()}
          />
        </Grid>
      </Grid>
    );
  };

  const spectralAveragingDropdown = () => {
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
      <Box pb={2}>
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
    const getOptions = () => (suppliedType > 0 ? OBSERVATION.Supplied[suppliedType - 1].units : []);

    return (
      <Box>
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
    const telescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
    const FrequencyUnitOptions = OBSERVATION.array.find(item => item.value === telescope)
      .CentralFrequencyAndBandWidthUnits;
    if (FrequencyUnitOptions.length === 1) {
      return FrequencyUnitOptions[0].label;
    } else {
      return (
        <DropDown
          options={FrequencyUnitOptions}
          testId="frequencyUnits"
          value={frequencyUnits}
          setValue={setFrequencyUnits}
          label=""
          onFocus={() => helpComponent(t('frequencyUnits.help'))}
        />
      );
    }
  };

  const continuumUnitsField = () => {
    const telescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
    const BandwidthUnitOptions = OBSERVATION.array.find(item => item.value === telescope)
      .CentralFrequencyAndBandWidthUnits;
    if (BandwidthUnitOptions.length === 1) {
      return (
        <Box pt={0}>
          <TextEntry
            value=""
            label=""
            labelBold
            labelPosition={LABEL_POSITION.BOTTOM}
            onFocus={() => helpComponent(t('continuumUnits.help'))}
            testId="continuumUnits"
            suffix={BandwidthUnitOptions[0].label}
          />
        </Box>
      );
    } else {
      return (
        <Box pt={0}>
          <DropDown
            options={BandwidthUnitOptions}
            testId="continuumUnits"
            value={continuumUnits}
            setValue={setContinuumUnits}
            label=""
            onFocus={() => helpComponent(t('continuumUnits.help'))}
          />
        </Box>
      );
    }
  };

  const suppliedValueField = () => {
    const errorMessage = () => {
      const min = Number(t('suppliedValue.range.lower'));
      return suppliedValue <= min ? t('suppliedValue.range.error') : '';
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

  const elevationUnitsField = () => t('elevation.units');

  const elevationField = () => {
    const errorMessage = () => {
      const min = Number(t('elevation.range.lower'));
      const max = Number(t('elevation.range.upper'));
      return elevation < min || elevation > max ? t('elevation.range.error') : '';
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            errorText={errorMessage()}
            label={t('elevation.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="elevation"
            value={elevation}
            setValue={setElevation}
            onFocus={() => helpComponent(t('elevation.help'))}
            suffix={elevationUnitsField()}
          />
        </Grid>
      </Grid>
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
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            errorText={errorMessage()}
            label={t('weather.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="weather"
            value={weather}
            setValue={setWeather}
            onFocus={() => helpComponent(t('weather.help'))}
            suffix={weatherUnitsField()}
          />
        </Grid>
      </Grid>
    );
  };

  const centralFrequencyField = () => {
    const errorMessage = () => {
      const lowMin = Number(t('centralFrequency.range.lowLower'));
      const lowMax = Number(t('centralFrequency.range.lowUpper'));
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;

      if (usedTelescope === TELESCOPE_LOW_NUM) {
        return Number(frequency) < lowMin || Number(frequency) > lowMax
          ? t('centralFrequency.range.lowError')
          : '';
      } else {
        if (observingBand != null) {
          const bandMin = Number(t('centralFrequency.range.bandLower' + observingBand));
          const bandMax = Number(t('centralFrequency.range.bandUpper' + observingBand));

          return Number(frequency) < bandMin || Number(frequency) > bandMax
            ? t('centralFrequency.range.midError')
            : '';
        }
      }
    };

    return (
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          <NumberEntry
            label={t('centralFrequency.label')}
            labelBold
            labelPosition={LABEL_POSITION.START}
            labelWidth={LABEL_WIDTH_OPT1}
            testId="frequency"
            value={frequency}
            setValue={setFrequency}
            onFocus={() => helpComponent(t('centralFrequency.help'))}
            required
            suffix={frequencyUnitsField()}
            errorText={errorMessage()}
          />
        </Grid>
      </Grid>
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
      <Grid pt={1} spacing={0} container direction="row">
        <Grid item xs={FIELD_WIDTH_OPT1}>
          {isContinuum() && (
            <NumberEntry
              errorText={errorMessage()}
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
  const continuumBandwidthField = () => {
    const errorMessage = () => {
      const lowMin = Number(t('continuumBandWidth.range.lowLower'));
      const lowMax = Number(t('continuumBandWidth.range.lowUpper'));
      const midMin = Number(t('continuumBandWidth.range.midLower'));
      const midMax = Number(t('continuumBandWidth.range.midUpper'));
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;

      if (usedTelescope === 2) {
        return continuumBandwidth <= lowMin || continuumBandwidth > lowMax
          ? t('continuumBandWidth.range.error')
          : '';
      } else if (usedTelescope === 1) {
        return continuumBandwidth <= midMin || continuumBandwidth > midMax
          ? t('continuumBandWidth.range.error')
          : '';
      }
    };

    return (
      <NumberEntry
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

  const effectiveResolutionFieldMid = () => {
    const calculateEffectiveResolution = () => {
      const spectralResolutionValue = String(spectralResolution).split('kHz');
      const effectiveResolution = Number(spectralResolutionValue[0]) * spectralAveraging;
      const resolution = Number(spectralResolutionValue[0]);
      const centralFrequency = getScaledValue(frequency, 1000000000, '*');
      const velocity = calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency);
      return `${effectiveResolution} kHz (${velocity})`;
    };

    return (
      <TextEntry
        label={t('effectiveResolution.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        labelWidth={LABEL_WIDTH_STD}
        testId="effective"
        value={calculateEffectiveResolution()}
        setValue={setEffective}
        onFocus={() => helpComponent(t('effectiveResolution.help'))}
        required
      />
    );
  };

  const effectiveResolutionFieldLow = () => {
    const calculateEffectiveResolution = () => {
      const spectralResolutionValue = String(spectralResolution).split('kHz');
      const effectiveResolution = Number(spectralResolutionValue[0]) * spectralAveraging;
      const resolution = Number(spectralResolutionValue[0]);
      const centralFrequency = getScaledValue(frequency, 1000000, '*');
      const velocity = calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency);
      return `${effectiveResolution.toFixed(2)} kHz (${velocity})`;
    };

    return (
      <TextEntry
        label={t('effectiveResolution.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        labelWidth={LABEL_WIDTH_STD}
        testId="effective"
        value={calculateEffectiveResolution()}
        setValue={setEffective}
        onFocus={() => helpComponent(t('effectiveResolution.help'))}
        required
      />
    );
  };

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
          {numOf13mAntennasField()}
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

  const numOf13mAntennasField = () => {
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

  const detailsField = () => {
    const numRows = Number(t('observationDetails.minDisplayRows'));
    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <TextEntry
          label={t('observationDetails.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LABEL_WIDTH_STD}
          testId="observationDetails"
          value={details}
          setValue={setDetails}
          onFocus={() => helpComponent(t('observationDetails.help'))}
          rows={t('observationDetails.minDisplayRows')}
        />
      </Box>
    );
  };

  const addButtonDisabled = () => {
    // TODO : We need to ensure we are able to progress.
    return false;
  };

  const pageFooter = () => {
    const addObservationToProposal = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      const newObservation = {
        id: myObsId,
        telescope: usedTelescope,
        subarray: subarrayConfig,
        linked: '0',
        type: observationType,
        observingBand: observingBand,
        weather: weather,
        elevation: elevation, // TODO: add min_elevation field and use it for LOW
        centralFrequency: `${frequency} ${
          OBSERVATION.Units.find(unit => unit.value === frequencyUnits).label
        }`,
        bandwidth: bandwidth,
        continuumBandwidth: `${continuumBandwidth} ${
          OBSERVATION.array
            .find(array => array.value === usedTelescope)
            .CentralFrequencyAndBandWidthUnits.find(unit => unit.value === continuumUnits).label
        }`,
        spectralAveraging: spectralAveraging,
        tapering: OBSERVATION.Tapering.find(item => item.value === tapering).label, // TODO understand how tapering is calculated in sens calc
        imageWeighting: imageWeighting,
        integrationTime: suppliedValue,
        integrationTimeUnits: suppliedUnits,
        spectralResolution: spectralResolution,
        effectiveResolution: 0, // TODO what does it need to be?
        numSubBands: subBands,
        num15mAntennas: numOf15mAntennas,
        num13mAntennas: numOf13mAntennas,
        numStations: numOfStations,
        details: details
      };
      setProposal({
        ...getProposal(),
        observations: [...getProposal().observations, newObservation],
        groupObservations: selectedGroupObservation
          ? [...getProposal().groupObservations, selectedGroupObservation]
          : getProposal().groupObservations
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
            <AddButton
              action={buttonClicked}
              disabled={addButtonDisabled()}
              primary
              title={'button.add'}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // center '+' icon on addGroup button
  // TODO: do this the MUI way
  const styles = `
    .buttonGroupContainer .css-1d6wzja-MuiButton-startIcon{
      margin-left: 0!important;
      margin-right: 0!important;
    }
  `;

  return (
    <>
      <style>{styles}</style>
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
              pb={3}
              justifyContent="space-evenly"
            >
              <Grid item xs={XS_TOP}>
                {groupObservationsField()}
              </Grid>
              <Grid item xs={XS_TOP}></Grid>
              <Grid item xs={XS_TOP}>
                {observingBandField()}
              </Grid>
              <Grid item xs={XS_TOP}>
                {arrayField()}
              </Grid>
              <Grid item xs={XS_TOP}>
                {isBand5() ? subArrayFieldBand5() : subArrayField()}
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
                    {isContinuumOnly()
                      ? observationTypeFieldContinuumOnly()
                      : observationTypeField()}
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
                    {isLow() ? spectralAveragingField() : spectralAveragingDropdown()}
                  </Grid>
                  <Grid item xs={XS_BOTTOM}>
                    {isLow() ? effectiveResolutionFieldLow() : effectiveResolutionFieldMid()}
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
    </>
  );
}
