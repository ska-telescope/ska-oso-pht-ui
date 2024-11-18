import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { AlertColorTypes, TextEntry } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../../utils/types/proposal';
import AddButton from '../../../components/button/Add/Add';
import ResolveButton from '../../../components/button/Resolve/Resolve';
import ReferenceFrameField from '../../../components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '../../../components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '../../../components/fields/skyDirection/SkyDirection2';
import VelocityField from '../../../components/fields/velocity/Velocity';
import HelpPanel from '../../../components/info/helpPanel/helpPanel';
import GetCoordinates from '../../../services/axios/getCoordinates/getCoordinates';
import Target from '../../../utils/types/target';
import { LAB_POSITION, VELOCITY_TYPE, WRAPPER_HEIGHT } from '../../../utils/constants';
import Notification from '../../../utils/types/notification';

interface TargetEntryProps {
  raType: number;
  setTarget?: Function;
  target?: Target;
}

export default function TargetEntry({ raType, setTarget = null, target = null }: TargetEntryProps) {
  const { t } = useTranslation('pht');

  const LAB_WIDTH = 5;
  const WRAPPER_WIDTH = '450px';
  const HELP_MAX_HEIGHT = '40vh';

  const {
    application,
    helpComponent,
    updateAppContent2,
    updateAppContent5
  } = storageObject.useStore();
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
  const [referenceFrame, setReferenceFrame] = React.useState(0);
  const NOTIFICATION_DELAY_IN_SECONDS = 5;

  const setTheName = (inValue: string) => {
    setName(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setTheDec = (inValue: string) => {
    setDec(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, dec: inValue });
    }
  };

  const setTheRA = (inValue: string) => {
    setRA(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, ra: inValue });
    }
  };

  const setTheRedshift = (inValue: string) => {
    setRedshift(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setTheReferenceFrame = (inValue: number) => {
    setReferenceFrame(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, referenceFrame: inValue });
    }
  };

  const setTheVel = (inValue: string) => {
    setVel(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, vel: inValue });
    }
  };

  const setTheVelType = (inValue: number) => {
    setVelType(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, velType: inValue });
    }
  };

  const setTheVelUnit = (inValue: number) => {
    setVelUnit(inValue);
    if (setTarget !== null) {
      setTarget({ ...target, velUnit: inValue });
    }
  };

  const targetIn = (target: Target) => {
    setId(target?.id);
    setName(target?.name);
    setRA(target?.ra);
    setDec(target?.dec);
    setVelType(target?.velType);
    setVel(target?.vel);
    setVelUnit(target?.velUnit);
    setRedshift(target?.redshift);
    setReferenceFrame(target?.referenceFrame);
  };

  React.useEffect(() => {
    helpComponent(t('name.help'));
    if (target) {
      targetIn(target);
    }
  }, []);

  function formValidation() {
    if (getProposal().targets.length === 0) {
      return true;
    } else if (getProposal().targets.length > 0) {
      getProposal().targets?.forEach(rec => {
        console.log('Chloe received name', rec.name);
        console.log('Chloe existing name', name);
        console.log('Verify', rec.name !== name);
        return rec.name !== name;
      });
    }
  }

  const addButton = () => {
    const addButtonAction = () => {
      if (formValidation() === true) {
        AddTheTarget();
        clearForm();
      } else {
        NotifyError(t('addTarget.error'));
      }
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal().targets.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

      const newTarget: Target = {
        dec: dec,
        decUnit: raType.toString(),
        id: highestId + 1,
        name: name,
        latitude: null,
        longitude: null,
        ra: ra,
        raUnit: raType.toString(),
        redshift: velType === VELOCITY_TYPE.REDSHIFT ? redshift : '',
        referenceFrame: referenceFrame,
        vel: velType === VELOCITY_TYPE.VELOCITY ? vel : '',
        velType: velType,
        velUnit: velUnit
      };
      setProposal({ ...getProposal(), targets: [...getProposal().targets, newTarget] });
      NotifyOK(t('addTarget.success'));
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
      <Grid item xs={12}>
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

  function Notify(str: string, lvl: AlertColorTypes = AlertColorTypes.Info) {
    const rec: Notification = {
      level: lvl,
      delay: NOTIFICATION_DELAY_IN_SECONDS,
      message: t(str),
      okRequired: false
    };
    updateAppContent5(rec);
  }
  const NotifyOK = (str: string) => Notify(str, AlertColorTypes.Success);
  const NotifyError = (str: string) => Notify(str, AlertColorTypes.Error);

  const resolveButton = () => {
    const processCoordinatesResults = response => {
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
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
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
    </Box>
  );

  const skyDirection1Field = () => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <SkyDirection1
        labelWidth={LAB_WIDTH}
        setValue={setTheRA}
        skyUnits={raType}
        value={ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    </Box>
  );

  const skyDirection2Field = () => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        setValue={setTheDec}
        skyUnits={raType}
        value={dec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
      />
    </Box>
  );

  const velocityField = () => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
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
    </Box>
  );

  const referenceFrameField = () => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <ReferenceFrameField
        labelWidth={LAB_WIDTH}
        onFocus={() => helpComponent(t('referenceFrame.help'))}
        setValue={setTheReferenceFrame}
        value={referenceFrame}
      />
    </Box>
  );

  return (
    <Grid
      p={5}
      container
      direction="row"
      alignItems="space-evenly"
      justifyContent="space-between"
      spacing={1}
    >
      <Grid item xs={7}>
        <Grid container direction="column" alignItems="stretch" justifyContent="flex-start">
          <Grid item>{nameField()}</Grid>
          <Grid item>{skyDirection1Field()}</Grid>
          <Grid item>{skyDirection2Field()}</Grid>
          <Grid item>{velocityField()}</Grid>
          <Grid item>{referenceFrameField()}</Grid>
          <Grid item>{!id && addButton()}</Grid>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <HelpPanel maxHeight={HELP_MAX_HEIGHT} />
      </Grid>
    </Grid>
  );
}
