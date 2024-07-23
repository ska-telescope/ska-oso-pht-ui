import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Grid, InputLabel, Paper, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  DropDown,
  NumberEntry,
  LABEL_POSITION,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import PageBanner from '../../components/layout/pageBanner/PageBanner';
import {
  BANDWIDTH_TELESCOPE,
  LAB_IS_BOLD,
  LAB_POSITION,
  MULTIPLIER_HZ_GHZ,
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
import ImageWeightingField from '../../components/fields/imageWeighting/imageWeighting';
import Observation, { NEW_OBSERVATION } from '../../utils/types/observation';

const XS_TOP = 5;
const XS_BOTTOM = 5;
const BACK_PAGE = 5;
const LINE_OFFSET = 30;

const LABEL_WIDTH_SELECT = 6;
const LABEL_WIDTH_OPT1 = 6;
const FIELD_WIDTH_BUTTON = 2;

export default function ObservationEntry() {
  const { t } = useTranslation('pht');
  const navigate = useNavigate();
  const locationProperties = useLocation();

  const isEdit = () => locationProperties.state !== null;

  const PAGE = isEdit() ? 14 : 10;

  const [observation, setObservation] = React.useState(NEW_OBSERVATION);

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [subarrayConfig, setSubarrayConfig] = React.useState(8);
  const [observingBand, setObservingBand] = React.useState(0);
  const [observationType, setObservationType] = React.useState(1);
  const [elevation, setElevation] = React.useState(Number(t('elevation.default')));
  const [weather, setWeather] = React.useState(Number(t('weather.default')));
  const [frequency, setFrequency] = React.useState(0);
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
  const [subBands, setSubBands] = React.useState(1);
  const [numOf15mAntennas, setNumOf15mAntennas] = React.useState(4);
  const [numOf13mAntennas, setNumOf13mAntennas] = React.useState(0);
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
    if (isEdit()) {
      setObservation(locationProperties.state);
    } else {
      const newId = generateId(t('addObservation.idPrefix'), 6);
      setMyObsId(newId);
    }
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
    if (observingBand === 0) {
      // Band Low
      setFrequency(OBSERVATION.CentralFrequencyOBLow[0].value);
      if (observationType === 1) {
        continuumBandwidth = OBSERVATION.ContinuumBandwidthOBLow.find(
          e => e.lookup === subarrayConfig
        );
        const valueContinuumBandwidth = continuumBandwidth?.value;
        setContinuumBandwidth(valueContinuumBandwidth);
      }
      setSpectralResolution(
        observationType === 1
          ? OBSERVATION.SpectralResolutionObLow[0].value
          : OBSERVATION.SpectralResolutionObLowZoom.find(item => item.bandWidthValue === bandwidth)
              .value
      );
    }
    if (observingBand === 1) {
      // Band 1
      centralFrequency = OBSERVATION.CentralFrequencyOB1.find(e => e.lookup === subarrayConfig);
      const valueCentralFrequency = centralFrequency?.value;
      setFrequency(valueCentralFrequency);
      if (observationType === 1) {
        continuumBandwidth = OBSERVATION.ContinuumBandwidthOB1.find(
          e => e.lookup === subarrayConfig
        );
        const valueContinuumBandwidth = continuumBandwidth?.value;
        setContinuumBandwidth(valueContinuumBandwidth);
      }
      if (observationType === 1) {
        const spectralResolution = OBSERVATION['SpectralResolutionOb1'].find(
          e => e.lookup === valueCentralFrequency
        );
        setSpectralResolution(spectralResolution?.value);
      } else {
        const spectralResolution = OBSERVATION['SpectralResolutionOb1Zoom'].find(
          e => e.lookup === valueCentralFrequency && e.bandWidthValue === bandwidth
        );
        setSpectralResolution(spectralResolution?.value);
      }
    }
    if (observingBand === 2) {
      // Band 2
      centralFrequency = OBSERVATION.CentralFrequencyOB2.find(e => e.lookup === subarrayConfig);
      const valueCentralFrequency = centralFrequency?.value;
      setFrequency(valueCentralFrequency);
      continuumBandwidth = OBSERVATION.ContinuumBandwidthOB2.find(e => e.lookup === subarrayConfig);
      const valueContinuumBandwidth = continuumBandwidth?.value;
      setContinuumBandwidth(valueContinuumBandwidth);
      if (observationType === 1) {
        const spectralResolution = OBSERVATION['SpectralResolutionOb2'].find(
          e => e.lookup === valueCentralFrequency
        );
        setSpectralResolution(spectralResolution?.value);
      } else {
        const spectralResolution = OBSERVATION['SpectralResolutionOb2Zoom'].find(
          e => e.lookup === valueCentralFrequency && e.bandWidthValue === bandwidth
        );
        setSpectralResolution(spectralResolution?.value);
      }
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
          : OBSERVATION.SpectralResolutionOb5aZoom.find(item => item.bandWidthValue === bandwidth)
              .value
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
          : OBSERVATION.SpectralResolutionOb5bZoom.find(item => item.bandWidthValue === bandwidth)
              .value
      );
    }
  }, [observingBand, subarrayConfig, subarrayConfig, observationType, bandwidth]);

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
      <Box pl={1} pt={0} pb={3}>
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
    return fieldDropdown(
      groupObservationId,
      'groupObservations',
      getOptions(),
      false,
      setGroupObservation,
      buttonGroupObservationsField(),
      groupObservation
    );
  };

  const subArrayField = (isBand5: boolean) => {
    const getOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      let subArrayOption = OBSERVATION.array[usedTelescope - 1]?.subarray;
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
    return fieldDropdown(
      false,
      'subArrayConfiguration',
      getOptions(),
      true,
      setSubarrayConfig,
      null,
      subarrayConfig
    );
  };

  const observationTypeField = (continuumOnly: boolean) => {
    const getOptions = () =>
      options(
        'observationType',
        continuumOnly ? OBSERVATION_TYPE.filter(e => e === TYPE_CONTINUUM) : OBSERVATION_TYPE
      );
    return fieldDropdown(
      false,
      'observationType',
      getOptions(),
      true,
      setObservationType,
      null,
      observationType
    );
  };

  const observingBandField = () => {
    const getOptions = () => {
      return BANDWIDTH_TELESCOPE
        ? BANDWIDTH_TELESCOPE
        : [{ label: 'Not applicable', telescope: 2, value: 0 }];
    };
    const disabled = !getOptions() || getOptions()?.length < 2;
    return fieldDropdown(
      disabled,
      'observingBand',
      getOptions(),
      true,
      setObservingBand,
      null,
      observingBand
    );
  };

  const arrayField = () => {
    const getOptions = () => {
      return TELESCOPES;
    };

    return (
      <DropDown
        options={getOptions()}
        disabled
        testId="arrayConfiguration"
        value={BANDWIDTH_TELESCOPE[observingBand].telescope}
        label={t('arrayConfiguration.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_SELECT}
        onFocus={() => helpComponent(t('arrayConfiguration.help'))}
      />
    );
  };

  const taperingField = () => {
    const frequencyInGHz = () => {
      return getScaledValue(frequency, MULTIPLIER_HZ_GHZ[frequencyUnits], '*');
    };

    const getOptions = () => {
      // TODO : This calculation is wrong, but I don't understand why.
      const results = [{ label: t('tapering.0'), value: 0 }];
      [1, 2, 3, 4, 5, 6, 7, 8].forEach(inValue => {
        const theLabel = (inValue * (1.4 / frequencyInGHz())).toFixed(3) + '"';
        results.push({ label: theLabel, value: inValue });
      });
      return results;
    };

    return fieldDropdown(false, 'tapering', getOptions(), true, setTapering, null, tapering);
  };

  const bandwidthField = () => {
    const getOptions = () => {
      const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
      return OBSERVATION.array[usedTelescope - 1].bandWidth;
    };
    return fieldDropdown(false, 'bandWidth', getOptions(), true, setBandwidth, null, bandwidth);
  };

  const robustField = () => {
    const getOptions = () => {
      if (imageWeighting === 2) {
        const usedTelescope = BANDWIDTH_TELESCOPE[observingBand].telescope;
        return OBSERVATION.array[usedTelescope - 1].robust;
      }
      return [{ label: '', value: 0 }];
    };
    return fieldDropdown(false, 'robust', getOptions(), true, setRobust, null, robust);
  };

  const spectralResolutionField = () => {
    function setSpectralResolutionDisplayValue(spectralResolution) {
      // low zoom mode
      if (observationType === 0 && observingBand === 0) {
        const spectralResolutionSplit = spectralResolution.split('Hz');
        const roundedRes = Number(spectralResolutionSplit[0]).toFixed(1);
        return `${roundedRes} Hz ${spectralResolutionSplit[1]}`;
        // low/mid continuum modes and mid zoom modes
      } else {
        return spectralResolution;
      }
    }

    return (
      <TextEntry
        testId="spectralResolution"
        value={setSpectralResolutionDisplayValue(spectralResolution)}
        label={t('spectralResolution.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        onFocus={() => helpComponent(t('spectralResolution.help'))}
        required
        disabled
      />
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
      <NumberEntry
        testId="spectral"
        value={String(spectralAveraging)}
        setValue={setSpectralAveraging}
        label={t('spectralAveraging.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        onFocus={() => helpComponent(t('spectralAveraging.help'))}
        required
        errorText={errorMessage()}
      />
    );
  };

  const fieldDropdown = (
    disabled: boolean,
    field: string,
    options: { label: string; value: string | number }[],
    required: boolean,
    setValue: Function,
    suffix,
    value: string | number
  ) => {
    return (
      <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
        <Grid pl={suffix ? 1 : 0} item xs={suffix ? 12 - FIELD_WIDTH_BUTTON : 12}>
          <DropDown
            disabled={disabled}
            options={options}
            testId={field}
            value={value}
            setValue={setValue}
            label={t(field + '.label')}
            labelBold={LAB_IS_BOLD}
            labelPosition={LAB_POSITION}
            labelWidth={suffix ? LABEL_WIDTH_OPT1 + 1 : LABEL_WIDTH_OPT1}
            onFocus={() => helpComponent(t(field + '.help'))}
            required={required}
          />
        </Grid>
        <Grid item xs={suffix ? FIELD_WIDTH_BUTTON : 0}>
          {suffix}
        </Grid>
      </Grid>
    );
  };

  const spectralAveragingDropdown = () => {
    const getOptions = () => OBSERVATION.SpectralAveraging;

    return fieldDropdown(
      false,
      'spectralAveraging',
      getOptions(),
      true,
      setSpectralAveraging,
      null,
      spectralAveraging
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

  const continuumUnitsField = () => (
    <Box pt={0}>
      <TextEntry
        value=""
        label=""
        labelBold={LAB_IS_BOLD}
        labelPosition={LABEL_POSITION.BOTTOM}
        onFocus={() => helpComponent(t('continuumUnits.help'))}
        testId="continuumUnits"
        suffix={BANDWIDTH_TELESCOPE[observingBand].units}
      />
    </Box>
  );

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
      <NumberEntry
        errorText={errorMessage()}
        label={t('elevation.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="elevation"
        value={elevation}
        setValue={setElevation}
        onFocus={() => helpComponent(t('elevation.help'))}
        suffix={elevationUnitsField()}
      />
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
      <NumberEntry
        errorText={errorMessage()}
        label={t('weather.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_SELECT}
        testId="weather"
        value={weather}
        setValue={setWeather}
        onFocus={() => helpComponent(t('weather.help'))}
        suffix={weatherUnitsField()}
      />
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
      <NumberEntry
        label={t('centralFrequency.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="frequency"
        value={frequency}
        setValue={setFrequency}
        onFocus={() => helpComponent(t('centralFrequency.help'))}
        required
        suffix={frequencyUnitsField()}
        errorText={errorMessage()}
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
      <NumberEntry
        errorText={errorMessage()}
        label={t('subBands.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="subBands"
        value={subBands}
        setValue={validate}
        onFocus={() => helpComponent(t('subBands.help'))}
        required
      />
    );
  };
  const continuumBandwidthField = () => {
    const errorMessage = () => {
      const rec = BANDWIDTH_TELESCOPE[observingBand];
      return continuumBandwidth < rec.lower || continuumBandwidth > rec.upper
        ? t('continuumBandWidth.range.error')
        : '';
    };

    return (
      <NumberEntry
        label={t('continuumBandWidth.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
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

  /*
  const UseEffectiveResolutionFieldMid = () => {
    const spectralResolutionValue = String(spectralResolution).split('kHz');
    const effectiveResolutionValue = Number(spectralResolutionValue[0]) * spectralAveraging;
    const resolution = Number(spectralResolutionValue[0]);
    const centralFrequency = getScaledValue(frequency, 1000000000, '*');
    const velocity = calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency);
    return `${effectiveResolutionValue} kHz (${velocity})`;
  };

  const UseEffectiveResolutionFieldLow = () => {
    const unit = observationType === 0 ? 'Hz' : 'kHz';
    const spectralResolutionValue = String(spectralResolution).split(unit);
    const resolution = Number(spectralResolutionValue[0]);
    const centralFrequency = getScaledValue(frequency, 1000000, '*');
    const decimal = observationType === 1 ? 2 : 1;
    const velocity =
      observationType === 1
        ? calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency)
        : calculateVelocity(resolution * spectralAveraging, centralFrequency);
    return `${(resolution * spectralAveraging).toFixed(decimal)} ${unit} (${velocity})`;
  };

  React.useEffect(() => {
    setEffective(isLow() ? UseEffectiveResolutionFieldLow() : UseEffectiveResolutionFieldMid());
  }, [spectralResolution, spectralAveraging, observationType, frequency]);
  */

  React.useEffect(() => {
    // TODO : Replace KHz / Hz with appropriate constants
    // TODO : Replace multipliers with appropriate constants to clarify code  (e.g. What is the purpose of 100000 ? )
    const unit = isLow() && observationType === 0 ? 'Hz' : 'kHz';
    const spectralResolutionValue = String(spectralResolution).split(unit);
    const resolution = Number(spectralResolutionValue[0]);
    if (isLow()) {
      const centralFrequency = getScaledValue(frequency, 1000000, '*');
      const decimal = observationType === 1 ? 2 : 1;
      const velocity =
        observationType === 1
          ? calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency)
          : calculateVelocity(resolution * spectralAveraging, centralFrequency);
      setEffective(`${(resolution * spectralAveraging).toFixed(decimal)} ${unit} (${velocity})`);
    } else {
      const centralFrequency = getScaledValue(frequency, 1000000000, '*');
      const effectiveResolutionValue = resolution * spectralAveraging;
      const velocity = calculateVelocity(resolution * spectralAveraging * 1000, centralFrequency);
      setEffective(`${effectiveResolutionValue} kHz (${velocity})`);
    }
  }, [spectralResolution, spectralAveraging, observationType, frequency]);

  const effectiveResolutionField = () => {
    return (
      <TextEntry
        label={t('effectiveResolution.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="effective"
        value={effective}
        onFocus={() => helpComponent(t('effectiveResolution.help'))}
        required
        setValue={setEffective}
        disabled
      />
    );
  };

  const AntennasFields = () => {
    return (
      <Grid pb={0} pt={1} container direction="row">
        <Grid item pt={1} xs={6}>
          <InputLabel disabled={subarrayConfig !== 20} shrink={false} htmlFor="numOf15mAntennas">
            <Typography sx={{ fontWeight: subarrayConfig === 20 ? 'bold' : 'normal' }}>
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
      <NumberEntry
        disabled={subarrayConfig !== 20}
        label={t('numOf15mAntennas.short')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
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
      if (
        num >= Number(t('numOf13mAntennas.range.lower')) &&
        num <= Number(t('numOf13mAntennas.range.upper'))
      ) {
        setNumOf13mAntennas(num);
      }
    };

    return (
      <NumberEntry
        disabled={subarrayConfig !== 20}
        label={t('numOf13mAntennas.short')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_OPT1}
        testId="numOf13mAntennas"
        value={numOf13mAntennas}
        setValue={validate}
        onFocus={() => helpComponent(t('numOf13mAntennas.help'))}
      />
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
      <NumberEntry
        disabled={subarrayConfig !== 20}
        label={t('numOfStations.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={LABEL_WIDTH_SELECT}
        testId="numOfStations"
        value={numOfStations}
        setValue={validate}
        onFocus={() => helpComponent(t('numOfStations.help'))}
      />
    );
  };

  const detailsField = () => {
    const numRows = Number(t('observationDetails.minDisplayRows'));
    return (
      <Box sx={{ height: LINE_OFFSET * numRows }}>
        <TextEntry
          label={t('observationDetails.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={LABEL_WIDTH_OPT1}
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
      const newObservation: Observation = {
        id: myObsId,
        telescope: usedTelescope,
        subarray: subarrayConfig,
        linked: '0',
        type: observationType,
        observingBand: observingBand,
        weather: weather,
        elevation: elevation, // TODO: add min_elevation field and use it for LOW // TODO modify elevation format and create elevation type to capure info needed for ElevationBackend type and update sens calc mapping
        /*centralFrequency: `${frequency} ${
          OBSERVATION.Units.find(unit => unit.value === frequencyUnits).label
        }`,*/
        centralFrequency: Number(frequency),
        centralFrequencyUnits: frequencyUnits,
        bandwidth: bandwidth,
        continuumBandwidth: continuumBandwidth,
        continuumBandwidthUnits: OBSERVATION.array
          .find(item => item.value === usedTelescope)
          .CentralFrequencyAndBandWidthUnits.find(
            u => u.label === BANDWIDTH_TELESCOPE[observingBand].units
          ).value,
        spectralAveraging: spectralAveraging,
        // tapering: OBSERVATION.Tapering.find(item => item.value === tapering).label, // TODO understand how tapering is calculated in sens calc
        imageWeighting: imageWeighting,
        supplied: {
          type: suppliedType,
          value: suppliedValue,
          units: suppliedUnits
        },
        spectralResolution: spectralResolution,
        effectiveResolution: effective,
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

    const updateObservationOnProposal = () => {
      setProposal({
        ...getProposal(),
        observations: [...getProposal().observations, observation],
        groupObservations: selectedGroupObservation
          ? [...getProposal().groupObservations, selectedGroupObservation]
          : getProposal().groupObservations
      });
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
              testId={isEdit() ? 'updateObservationButton' : 'addObservationButton'}
              title={isEdit() ? 'button.update' : 'button.add'}
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
                {subArrayField(isBand5())}
              </Grid>
              <Grid item xs={XS_TOP}>
                {isLow() ? NumOfStationsField() : AntennasFields()}
              </Grid>
              <Grid item xs={XS_TOP}>
                {elevationField()}
              </Grid>
              <Grid item xs={XS_TOP}>
                {!isLow() && weatherField()}
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
                    {observationTypeField(isContinuumOnly())}
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
                    {effectiveResolutionField()}
                  </Grid>
                  <Grid item xs={XS_BOTTOM}>
                    {!isLow() && taperingField()}
                  </Grid>
                  <Grid item xs={XS_BOTTOM}>
                    {isContinuum() && SubBandsField()}
                  </Grid>
                  <Grid item xs={XS_BOTTOM}>
                    <ImageWeightingField
                      labelWidth={LABEL_WIDTH_OPT1}
                      onFocus={() => helpComponent(t('imageWeighting.help'))}
                      setValue={setImageWeighting}
                      value={imageWeighting}
                    />
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
