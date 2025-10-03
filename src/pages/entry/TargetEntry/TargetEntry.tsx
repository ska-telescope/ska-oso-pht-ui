import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import ReferenceCoordinatesField from '@components/fields/referenceCoordinates/ReferenceCoordinates.tsx';
import PulsarTimingBeamField from '@components/fields/pulsarTimingBeam/PulsarTimingBeam.tsx';
import ExtendedStrikethroughLabelBehindText from '@components/info/extendedStrikethroughLabelBehindText/ExtendedStrikethroughLabelBehindText.tsx';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import ResolveButton from '@/components/button/Resolve/Resolve';
import ReferenceFrameField from '@/components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import Target, { TiedArrayBeams } from '@/utils/types/target';
import {
  RA_TYPE_ICRS,
  LAB_POSITION,
  VELOCITY_TYPE,
  LAB_IS_BOLD,
  FIELD_PATTERN_POINTING_CENTRES
} from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
interface TargetEntryProps {
  raType: number;
  setTarget?: Function;
  target?: Target;
  textAlign?: string;
}

const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function TargetEntry({
  raType,
  setTarget = undefined,
  target = undefined,
  textAlign = 'right'
}: TargetEntryProps) {
  const { t } = useScopedTranslation();
  const { notifySuccess } = useNotify();

  const LAB_WIDTH = 5;
  const HELP_MAX_HEIGHT = '40vh';
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');

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
  const [beamArrayData, setBeamArrayData] = React.useState<TiedArrayBeams[]>([]);

  const LABEL_WIDTH = 6;

  const setTheName = (inValue: string) => {
    setName(inValue);
    if (setTarget) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setTheDec = (inValue: string) => {
    setDec(inValue);
    if (setTarget) {
      setTarget({ ...target, decStr: inValue });
    }
  };

  const setTheRA = (inValue: string) => {
    setRA(inValue);
    if (setTarget) {
      setTarget({ ...target, raStr: inValue });
    }
  };

  const setBeamData = (allBeams: any[]) => {
    console.log('Accessed allBeams data:', allBeams);

    if (setTarget) {
      setTarget({ ...target, tiedArrayBeams: allBeams });
    }
    console.log('allBeams data ', allBeams);
    setBeamArrayData(allBeams);
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
    setReferenceFrame(target?.kind ?? 0);
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
      } else {
        AddTheTarget();
        clearForm();
      }
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal()?.targets?.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

      console.log('beam array data ', beamArrayData);

      const newTarget: Target = {
        kind: RA_TYPE_ICRS.value,
        decStr: dec,
        id: highestId + 1,
        name: name,
        b: undefined,
        l: undefined,
        raStr: ra,
        redshift: velType === VELOCITY_TYPE.REDSHIFT ? redshift : '',
        referenceFrame: RA_TYPE_ICRS.label,
        vel: velType === VELOCITY_TYPE.VELOCITY ? vel : '',
        velType: velType,
        velUnit: velUnit,
        tiedArrayBeams: beamArrayData
      };

      setProposal({ ...getProposal(), targets: [...(getProposal().targets ?? []), newTarget] });
      console.log('target TargetEntry', newTarget);
      notifySuccess(t('addTarget.success'), NOTIFICATION_DELAY_IN_SECONDS);
    };

    const clearForm = () => {
      setName('');
      setRA('');
      setDec('');
      setVel('');
      setRedshift('');
    };

    const disabled = () => !(name?.length && ra?.length && dec?.length);

    return (
      <Grid size={{ xs: 12 }}>
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

  const wrapper = (children: any) => <Box sx={{ width: '100%' }}>{children}</Box>;

  const referenceCoordinatesField = () =>
    wrapper(
      <ReferenceCoordinatesField
        labelWidth={LABEL_WIDTH}
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
          labelWidth={LABEL_WIDTH}
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
      <PulsarTimingBeamField setTarget={setTarget} target={target} onDialogResponse={setBeamData} />
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
    <Grid p={2} container direction="row" alignItems="space-evenly" justifyContent="space-between">
      <Grid size={{ xs: 8 }}>
        <Grid
          container
          direction="column"
          spacing={2}
          alignItems="stretch"
          justifyContent="flex-start"
        >
          <ExtendedStrikethroughLabelBehindText labelText="COORDINATE TYPE" />
          <Grid>{referenceCoordinatesField()}</Grid>
          <ExtendedStrikethroughLabelBehindText labelText="COORDINATE" />
          <Grid>{nameField()}</Grid>
          <Grid>{skyDirection1Field()}</Grid>
          <Grid>{skyDirection2Field()}</Grid>
          <ExtendedStrikethroughLabelBehindText labelText="PULSAR TIMING BEAM" />
          <Grid>{pulsarTimingBeamField()}</Grid>
          <ExtendedStrikethroughLabelBehindText labelText="RADIAL MOTION" />
          <Grid>{velocityField()}</Grid>
          <Grid>{velType === VELOCITY_TYPE.VELOCITY && referenceFrameField()}</Grid>
          <ExtendedStrikethroughLabelBehindText labelText="FIELD PATTERN" />
          <Grid>{fieldPatternTypeField()}</Grid>
          <Grid>{!id && addButton()}</Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 4 }}>
        <HelpPanel maxHeight={HELP_MAX_HEIGHT} />
      </Grid>
    </Grid>
  );
}
