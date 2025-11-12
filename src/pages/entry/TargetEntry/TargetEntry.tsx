import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import {
  BorderedSection,
  TextEntry,
  InfoCard,
  InfoCardColorTypes
} from '@ska-telescope/ska-gui-components';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import ReferenceCoordinatesField from '@components/fields/referenceCoordinates/ReferenceCoordinates.tsx';
import PulsarTimingBeamField from '@components/fields/pulsarTimingBeam/PulsarTimingBeam.tsx';
import { generateId, leadZero } from '@utils/helpers.ts';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import ResolveButton from '@/components/button/Resolve/Resolve';
import ReferenceFrameField from '@/components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import Target, { Beam, TiedArrayBeams } from '@/utils/types/target';
import {
  RA_TYPE_ICRS,
  LAB_POSITION,
  VELOCITY_TYPE,
  LAB_IS_BOLD,
  FIELD_PATTERN_POINTING_CENTRES,
  HELP_FONT,
  WRAPPER_HEIGHT,
  FREQUENCY_MHZ,
  TELESCOPE_LOW_NUM,
  OB_SUBARRAY_AA2,
  BAND_LOW,
  TYPE_CONTINUUM,
  SUPPLIED_INTEGRATION_TIME_UNITS_H,
  SUPPLIED_TYPE_INTEGRATION
} from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useAppFlow } from '@/utils/appFlow/AppFlowContext';
import Observation from '@/utils/types/observation';
import {
  calculateCentralFrequency,
  calculateContinuumBandwidth
} from '@/utils/calculate/calculate';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { calculateSensCalcData } from '@/utils/sensCalc/sensCalc';
interface TargetEntryProps {
  raType: number;
  setTarget?: Function;
  target?: Target;
  textAlign?: string;
  showBeamData?: boolean;
  onRAFieldErrorChange?: (error: string) => void;
  onDecFieldErrorChange?: (error: string) => void;
  onNameFieldErrorChange?: (error: string) => void;
}

const NOTIFICATION_DELAY_IN_SECONDS = 5;
const PANEL_HEIGHT = '54vh';
const MOCK_CALL = true;

export default function TargetEntry({
  raType,
  setTarget = undefined,
  target = undefined,
  showBeamData,
  onRAFieldErrorChange,
  onDecFieldErrorChange,
  onNameFieldErrorChange
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { isSV } = useAppFlow();
  const { notifyError, notifySuccess } = useNotify();
  const { observatoryConstants } = useOSDAccessors();

  const LAB_WIDTH = 5;
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [skyDirection1Error, setSkyDirection1Error] = React.useState('');
  const [skyDirection2Error, setSkyDirection2Error] = React.useState('');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  const [id, setId] = React.useState(0);
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [velType, setVelType] = React.useState(0);
  const [vel, setVel] = React.useState('');
  const [velUnit, setVelUnit] = React.useState(0);
  const [redshift, setRedshift] = React.useState('');
  const [referenceFrame, setReferenceFrame] = React.useState(RA_TYPE_ICRS.value);
  const [referenceCoordinates, setReferenceCoordinates] = React.useState(RA_TYPE_ICRS.label);
  const [fieldPattern, setFieldPattern] = React.useState(FIELD_PATTERN_POINTING_CENTRES);
  const [tiedArrayBeams, setTiedArrayBeams] = React.useState<TiedArrayBeams | null>(null);
  const [resetBeamArrayData, setResetBeamArrayData] = React.useState(false);

  React.useEffect(() => {
    if (nameFieldError === t('addTarget.error')) {
      if (formValidation()) {
        setNameFieldError('');
      }
    }
  }, [name]);

  React.useEffect(() => {
    if (setTarget) {
      setTarget({ ...target, decStr: dec, raStr: ra, vel: vel, redshift: redshift });
    }
  }, [ra, dec, vel, redshift]);

  React.useEffect(() => {
    if (onRAFieldErrorChange) {
      onRAFieldErrorChange(skyDirection1Error); // Notify parent
    }
  }, [skyDirection1Error]);

  React.useEffect(() => {
    if (onDecFieldErrorChange) {
      onDecFieldErrorChange(skyDirection2Error); // Notify parent
    }
  }, [skyDirection2Error]);

  React.useEffect(() => {
    if (onNameFieldErrorChange) {
      onNameFieldErrorChange(nameFieldError); // Notify parent
    }
  }, [nameFieldError]);

  const setTheName = (inValue: string) => {
    setName(inValue);
    if (!inValue.trim()) {
      setNameFieldError(t('addTarget.valueError'));
    } else {
      setNameFieldError('');
    }
    if (setTarget) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setTheDec = (inValue: string) => {
    const formattedDec = leadZero(inValue);
    setDec(formattedDec.toString());
    if (setTarget) {
      setTarget({ ...target, decStr: formattedDec.toString() });
    }
  };

  const setTheRA = (inValue: string) => {
    const formattedRA = leadZero(inValue);
    setRA(formattedRA.toString());
    if (setTarget) {
      setTarget({ ...target, raStr: formattedRA.toString() });
    }
  };

  const getTiedArrayBeams = (beams: Beam[]): TiedArrayBeams => {
    return {
      pstBeams: beams,
      pssBeams: [],
      vlbiBeams: []
    };
  };

  const handleBeamData = (beams: Beam[]) => {
    const tiedArrayBeams: TiedArrayBeams = getTiedArrayBeams(beams);
    if (setTarget !== undefined) {
      setTarget({ ...target, tiedArrayBeams: tiedArrayBeams });
    }
    setTiedArrayBeams(tiedArrayBeams);
  };

  const setTheRedshift = (inValue: string) => {
    setRedshift(inValue);
    if (setTarget) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setTheReferenceFrame = (inValue: React.SetStateAction<number>) => {
    setReferenceFrame(inValue);
    if (setTarget) {
      setTarget({ ...target, kind: inValue });
    }
  };

  const setTheVel = (inValue: string) => {
    setVel(inValue);
    if (setTarget) {
      setTarget({ ...target, vel: inValue });
    }
  };

  const setTheVelType = (inValue: number) => {
    setVelType(inValue);
    if (setTarget) {
      setTarget({ ...target, velType: inValue });
    }
  };

  const setTheVelUnit = (inValue: number) => {
    setVelUnit(inValue);
    if (setTarget) {
      setTarget({ ...target, velUnit: inValue });
    }
  };

  const targetIn = (target: Target) => {
    setId(target?.id ?? 0);
    setName(target?.name ?? '');
    setRA(target?.raStr ?? '');
    setDec(target?.decStr ?? '');
    setVelType(target?.velType ?? 0);
    setVel(target?.vel ?? '');
    setVelUnit(target?.velUnit ?? 0);
    setRedshift(target?.redshift ?? '');
    setReferenceFrame(target?.kind ?? RA_TYPE_ICRS.value);
    setTiedArrayBeams(target?.tiedArrayBeams as TiedArrayBeams);
  };

  React.useEffect(() => {
    helpComponent(t('name.help'));
    if (target) {
      targetIn(target);
    }
  }, []);

  function formValidation() {
    let valid = true;
    const targets = getProposal()?.targets;
    targets?.forEach(rec => {
      if (rec.name.toLowerCase() === name.toLowerCase()) {
        valid = false;
        setNameFieldError(t('addTarget.error'));
      }
    });
    return valid;
  }

  const addButton = () => {
    const addButtonAction = () => {
      if (!formValidation()) {
        return;
      } else {
        AddTheTarget();
        clearForm();
        setResetBeamArrayData(true);
      }
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal()?.targets?.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

      const observationOut = () => {
        const newObservation: Observation = {
          id: generateId(t('addObservation.idPrefix'), 6),
          telescope: TELESCOPE_LOW_NUM,
          subarray: OB_SUBARRAY_AA2,
          linked: '0',
          type: TYPE_CONTINUUM,
          observingBand: BAND_LOW,
          centralFrequency: calculateCentralFrequency(
            BAND_LOW,
            OB_SUBARRAY_AA2,
            observatoryConstants
          ),
          centralFrequencyUnits: FREQUENCY_MHZ,
          continuumBandwidth: calculateContinuumBandwidth(
            BAND_LOW,
            OB_SUBARRAY_AA2,
            observatoryConstants
          ),
          continuumBandwidthUnits: FREQUENCY_MHZ,
          elevation: 15,
          bandwidth: null,
          imageWeighting: 0,
          numStations: 512,
          numSubBands: 1,
          robust: 0,
          supplied: {
            type: SUPPLIED_TYPE_INTEGRATION,
            value: 1,
            units: SUPPLIED_INTEGRATION_TIME_UNITS_H
          },
          spectralAveraging: 1,
          spectralResolution: '',
          effectiveResolution: ''
        };
        return newObservation;
      };

      const newTarget: Target = {
        kind: RA_TYPE_ICRS.value,
        decStr: dec ?? '',
        id: highestId + 1,
        name: name ?? '',
        b: 0, // Default value for `b`
        l: 0, // Default value for `l`
        raStr: ra ?? '',
        redshift: velType === VELOCITY_TYPE.REDSHIFT ? redshift ?? '' : '',
        referenceFrame: RA_TYPE_ICRS.label,
        vel: velType === VELOCITY_TYPE.VELOCITY ? vel ?? '' : '',
        velType: velType ?? 0,
        velUnit: velUnit ?? 0,
        tiedArrayBeams: tiedArrayBeams ? (tiedArrayBeams as TiedArrayBeams) : null
      };

      const getSensCalcData = async (observation: Observation, target: Target) => {
        const response = await calculateSensCalcData(observation, target);
        if (response) {
          if (response.error) {
            const errMsg = response.error;
            notifyError(errMsg, NOTIFICATION_DELAY_IN_SECONDS);
          }
          return response;
        }
      };

      const addTargetAsync = async () => {
        let newObservation = undefined;
        let sensCalcResult = undefined;
        if (MOCK_CALL) {
          newObservation = observationOut();
          sensCalcResult = await getSensCalcData(newObservation, newTarget);
        }
        const updatedProposal = {
          ...getProposal(),
          targets: [...(getProposal().targets ?? []), newTarget],
          observations: MOCK_CALL
            ? [newObservation].filter((obs): obs is Observation => obs !== undefined)
            : getProposal().observations,
          targetObservation: MOCK_CALL
            ? sensCalcResult && newObservation && newObservation.id
              ? [
                  {
                    targetId: newTarget.id,
                    observationId: newObservation.id,
                    sensCalc: sensCalcResult
                  }
                ]
              : []
            : getProposal().targetObservation
        };
        setProposal(updatedProposal);
        notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
      };
      addTargetAsync();
    };

    const clearForm = () => {
      setName('');
      setRA('');
      setDec('');
      setVel('');
      setRedshift('');
      setTiedArrayBeams(null);
    };

    const disabled = () => {
      return (
        nameFieldError !== '' ||
        skyDirection1Error !== '' ||
        skyDirection2Error !== '' ||
        !(name?.length && ra?.length && dec?.length && targetLengthCheck())
      );
    };

    const targetLengthCheck = () => {
      return isSV() ? getProposal()?.targets?.length === 0 : true;
    };

    return (
      <Grid size={{ xs: 12 }} sx={{ position: 'relative', zIndex: 99 }} mb={2}>
        <AddButton
          action={addButtonAction}
          disabled={disabled()}
          primary
          testId={'addTargetButton'}
          title="addTarget.label"
          toolTip="addTarget.toolTip"
        />
      </Grid>
    );
  };

  const resolveButton = () => {
    const processCoordinatesResults = (response: any) => {
      if (response && !response.error) {
        const values = response.split(' ');
        const redshift =
          values?.length > 2 && values[2] !== 'null'
            ? Number(values[2])
                .toExponential(2)
                .toString()
            : '';
        const vel = values?.length > 3 && values[3] !== 'null' ? values[3] : '';
        setDec(values[0]);
        setRA(values[1]);
        setRedshift(redshift);
        setVel(vel);
        setNameFieldError('');
      } else {
        setNameFieldError(t('resolve.error.' + response.error));
      }
    };

    const getCoordinates = async () => {
      const response = await GetCoordinates(name, raType);
      processCoordinatesResults(response);
    };

    return (
      <ResolveButton action={() => getCoordinates()} disabled={!name} testId={'resolveButton'} />
    );
  };

  const wrapper = (children?: React.JSX.Element) => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT }}>
      {children}
    </Box>
  );

  const referenceCoordinatesField = () =>
    wrapper(
      <ReferenceCoordinatesField
        labelWidth={LAB_WIDTH}
        setValue={setReferenceCoordinates}
        value={referenceCoordinates.toUpperCase()}
      />
    );

  const fieldPatternTypeField = () => {
    return wrapper(
      <Box pt={1}>
        <TextEntry
          disabled={true}
          label={t('fieldPattern.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={LAB_WIDTH}
          onFocus={() => helpComponent(t('fieldPattern.help'))}
          testId="fieldPatternId"
          value={fieldPattern}
          setValue={setFieldPattern}
          toolTip={t('fieldPattern.toolTip')}
        />
      </Box>
    );
  };

  const pulsarTimingBeamField = () => {
    return wrapper(
      <PulsarTimingBeamField
        target={target}
        onDialogResponse={handleBeamData}
        resetBeamData={resetBeamArrayData}
        showBeamData={showBeamData}
      />
    );
  };
  const nameField = () =>
    wrapper(
      <TextEntry
        required
        label={t('name.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={LAB_WIDTH}
        testId={'name'}
        value={name}
        setValue={setTheName}
        suffix={resolveButton()}
        onFocus={() => helpComponent(t('name.help'))}
        errorText={nameFieldError}
      />
    );

  const skyDirection1Field = () =>
    wrapper(
      <SkyDirection1
        labelWidth={LAB_WIDTH}
        setValue={setTheRA}
        skyUnits={raType}
        value={ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
        setErrorText={setSkyDirection1Error} // Pass the callback
      />
    );

  const skyDirection2Field = () =>
    wrapper(
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        setValue={setTheDec}
        skyUnits={raType}
        value={dec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
        setErrorText={setSkyDirection2Error} // Pass the callback
      />
    );

  const velocityField = () =>
    wrapper(
      <VelocityField
        labelWidth={LAB_WIDTH}
        setRedshift={setTheRedshift}
        setVel={setTheVel}
        setVelType={setTheVelType}
        setVelUnit={setTheVelUnit}
        redshift={redshift}
        vel={vel}
        velType={velType}
        velUnit={velUnit}
        velFocus={() => helpComponent(t('velocity.help' + velType))}
        // velTypeFocus={() => helpComponent('')}   TODO : Need to find out why this is not working great
        velUnitFocus={() => helpComponent(t('velocity.help' + velType))}
      />
    );

  const referenceFrameField = () =>
    wrapper(
      <ReferenceFrameField
        labelWidth={LAB_WIDTH}
        onFocus={() => helpComponent(t('referenceFrame.help'))}
        setValue={setTheReferenceFrame}
        value={referenceFrame}
      />
    );

  return (
    <>
      <Box sx={{ width: '100%', height: '85%' }}>
        <Grid
          p={2}
          container
          direction="row"
          alignItems="space-evenly"
          justifyContent="space-between"
        >
          <Grid size={{ xs: 8 }} sx={{ position: 'relative' }}>
            <Box
              pr={2}
              sx={{
                width: '100%',
                height: PANEL_HEIGHT,
                overflowY: 'auto'
              }}
            >
              <Grid
                container
                direction="column"
                spacing={2}
                alignItems="stretch"
                justifyContent="flex-start"
                pt={1}
                pb={2}
              >
                <Grid>
                  <BorderedSection title={t('referenceCoordinates.label')}>
                    {referenceCoordinatesField()}
                  </BorderedSection>
                </Grid>
                <Grid pt={1}>
                  <BorderedSection title={t('coordinate.label')}>
                    {nameField()}
                    {skyDirection1Field()}
                    {skyDirection2Field()}
                  </BorderedSection>
                </Grid>
                {!isSV() && (
                  <Grid pt={1}>
                    <BorderedSection title={t('pulsarTimingBeam.groupLabel')}>
                      {pulsarTimingBeamField()}
                    </BorderedSection>
                  </Grid>
                )}
                <Grid pt={1}>
                  <BorderedSection title={t('radialMotion.label')}>
                    {velocityField()}
                    {velType === VELOCITY_TYPE.VELOCITY && referenceFrameField()}
                  </BorderedSection>
                </Grid>
                {!isSV() && (
                  <Grid pt={1}>
                    <BorderedSection title={t('fieldPattern.groupLabel')}>
                      {fieldPatternTypeField()}
                    </BorderedSection>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Grid>

          <Grid size={{ xs: 4 }} sx={{ position: 'relative', height: PANEL_HEIGHT }}>
            {isSV() && (getProposal()?.targets?.length ?? 0) > 0 && (
              <InfoCard
                color={InfoCardColorTypes.Warning}
                fontSize={HELP_FONT}
                message={t('targets.limitReached')}
                testId="targetLimitPanelId"
              />
            )}

            {!id && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0
                }}
              >
                {addButton()}
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
