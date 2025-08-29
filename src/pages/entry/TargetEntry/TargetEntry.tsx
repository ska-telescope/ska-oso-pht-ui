import React from 'react';
import { useTranslation } from 'react-i18next';
import { Grid2 } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import GetCoordinates from '@services/axios/get/getCoordinates/getCoordinates';
import { Proposal } from '@/utils/types/proposal';
import AddButton from '@/components/button/Add/Add';
import ResolveButton from '@/components/button/Resolve/Resolve';
import ReferenceFrameField from '@/components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '@/components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '@/components/fields/skyDirection/SkyDirection2';
import VelocityField from '@/components/fields/velocity/Velocity';
import HelpPanel from '@/components/info/helpPanel/HelpPanel';
import FieldWrapper from '@/components/wrappers/fieldWrapper/FieldWrapper';
import Target from '@/utils/types/target';
import { RA_TYPE_ICRS, LAB_POSITION, VELOCITY_TYPE } from '@/utils/constants';
import { useNotify } from '@/utils/notify/useNotify';
interface TargetEntryProps {
  raType: number;
  setTarget?: Function;
  target?: Target;
}

const NOTIFICATION_DELAY_IN_SECONDS = 5;

export default function TargetEntry({
  raType,
  setTarget = undefined,
  target = undefined
}: TargetEntryProps) {
  const { t } = useTranslation('pht');
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

  const setTheName = (inValue: string) => {
    setName(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setTheDec = (inValue: string) => {
    setDec(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, decStr: inValue });
    }
  };

  const setTheRA = (inValue: string) => {
    setRA(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, raStr: inValue });
    }
  };

  const setTheRedshift = (inValue: string) => {
    setRedshift(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setTheReferenceFrame = (inValue: React.SetStateAction<number>) => {
    setReferenceFrame(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, kind: inValue });
    }
  };

  const setTheVel = (inValue: string) => {
    setVel(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, vel: inValue });
    }
  };

  const setTheVelType = (inValue: number) => {
    setVelType(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, velType: inValue });
    }
  };

  const setTheVelUnit = (inValue: number) => {
    setVelUnit(inValue);
    if (setTarget !== undefined) {
      setTarget({ ...target, velUnit: inValue });
    }
  };

  const targetIn = (target: Target) => {
    setId(target?.id);
    setName(target?.name);
    setRA(target?.raStr as string);
    setDec(target?.decStr as string);
    setVelType(target?.velType);
    setVel(target?.vel);
    setVelUnit(target?.velUnit);
    setRedshift(target?.redshift);
    setReferenceFrame(target?.kind);
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
        velUnit: velUnit
      };
      setProposal({ ...getProposal(), targets: [...(getProposal().targets ?? []), newTarget] });
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
      <Grid2 size={{ xs: 12 }}>
        <AddButton
          action={addButtonAction}
          disabled={disabled()}
          primary
          testId={'addTargetButton'}
          title="addTarget.label"
          toolTip="addTarget.toolTip"
        />
      </Grid2>
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

  const nameField = () => (
    <FieldWrapper>
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
    </FieldWrapper>
  );

  const skyDirection1Field = () => (
    <FieldWrapper>
      <SkyDirection1
        labelWidth={LAB_WIDTH}
        setValue={setTheRA}
        skyUnits={raType}
        value={ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    </FieldWrapper>
  );

  const skyDirection2Field = () => (
    <FieldWrapper>
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        setValue={setTheDec}
        skyUnits={raType}
        value={dec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
      />
    </FieldWrapper>
  );

  const velocityField = () => (
    <FieldWrapper>
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
    </FieldWrapper>
  );

  const referenceFrameField = () => (
    <FieldWrapper>
      <ReferenceFrameField
        labelWidth={LAB_WIDTH}
        onFocus={() => helpComponent(t('referenceFrame.help'))}
        setValue={setTheReferenceFrame}
        value={referenceFrame}
      />
    </FieldWrapper>
  );

  return (
    <Grid2
      p={2}
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-between"
      spacing={1}
    >
      <Grid2 size={{ xs: 7 }}>
        <Grid2 container direction="column" alignItems="stretch" justifyContent="flex-start">
          <Grid2>{nameField()}</Grid2>
          <Grid2>{skyDirection1Field()}</Grid2>
          <Grid2>{skyDirection2Field()}</Grid2>
          <Grid2>{velocityField()}</Grid2>
          <Grid2>{velType === VELOCITY_TYPE.VELOCITY && referenceFrameField()}</Grid2>
          <Grid2>{!id && addButton()}</Grid2>
        </Grid2>
      </Grid2>
      <Grid2 size={{ xs: 4 }}>
        <HelpPanel maxHeight={HELP_MAX_HEIGHT} />
      </Grid2>
    </Grid2>
  );
}
