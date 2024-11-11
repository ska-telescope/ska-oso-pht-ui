import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
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
import { LAB_POSITION, VELOCITY_TYPE } from '../../../utils/constants';

interface TargetEntryProps {
  id?: number;
  raType: number;
  setTarget: Function;
  target: Target;
}

export default function TargetEntry({ id = 0, raType, setTarget, target }: TargetEntryProps) {
  const { t } = useTranslation('pht');
  const LAB_WIDTH = 5;
  const WRAPPER_HEIGHT = '80px';
  const WRAPPER_WIDTH = '450px';
  const HELP_MAX_HEIGHT = '40vh';

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(t('name.help'));
    if (id) {
      setTarget(getProposal().targets.find(p => p.id === id));
    }
  }, []);

  const setDec = (inValue: string) => {
    setTarget({ ...target, dec: inValue });
  };

  const setName = (inValue: string) => {
    setTarget({ ...target, name: inValue });
  };

  const setRA = (inValue: string) => {
    setTarget({ ...target, ra: inValue });
  };

  const setRedshift = (inValue: string) => {
    setTarget({ ...target, redshift: inValue });
  };

  const setReferenceFrame = (inValue: number) => {
    setTarget({ ...target, referenceFrame: inValue });
  };

  const setVel = (inValue: string) => {
    setTarget({ ...target, vel: inValue });
  };

  const setVelType = (inValue: number) => {
    setTarget({ ...target, velType: inValue });
  };

  const setVelUnit = (inValue: number) => {
    setTarget({ ...target, velUnit: inValue });
  };

  const addButton = () => {
    const addButtonAction = () => {
      AddTheTarget();
      clearForm();
    };

    const AddTheTarget = () => {
      const highest = getProposal()?.targets?.length
        ? getProposal().targets.reduce((prev, current) =>
            prev && prev.id > current.id ? prev : current
          )
        : null;
      const highestId = highest ? highest.id : 0;

      const newTarget: Target = {
        dec: target.dec,
        decUnit: raType.toString(),
        id: highestId + 1,
        name: target.name,
        latitude: null,
        longitude: null,
        ra: target.ra,
        raUnit: raType.toString(),
        redshift: target.velType === VELOCITY_TYPE.REDSHIFT ? target?.redshift : '',
        referenceFrame: target.referenceFrame,
        vel: target.velType === VELOCITY_TYPE.VELOCITY ? target?.vel : '',
        velType: target.velType,
        velUnit: target.velUnit
      };
      setProposal({ ...getProposal(), targets: [...getProposal().targets, newTarget] });
    };

    const clearForm = () => {
      setTarget({ ...target, name: '', ra: '', dec: '', redshift: '', vel: '' });
    };

    const disabled = () => !(target?.name?.length && target?.ra?.length && target?.dec?.length);

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
        setTarget({ ...target, dec: values[0], ra: values[1], redshift: redshift, vel: vel });
        setNameFieldError('');
      } else {
        setNameFieldError(t('resolve.error.' + response.error));
      }
    };

    const getCoordinates = async (targetName: string, skyUnits: number) => {
      const response = await GetCoordinates(targetName, skyUnits);
      processCoordinatesResults(response);
    };

    return (
      <ResolveButton
        action={() => getCoordinates(target?.name, raType)}
        disabled={!target.name}
        testId={'resolveButton'}
      />
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
        value={target?.name}
        setValue={setName}
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
        setValue={setRA}
        skyUnits={raType}
        value={target?.ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    </Box>
  );

  const skyDirection2Field = () => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        setValue={setDec}
        skyUnits={raType}
        value={target?.dec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
      />
    </Box>
  );

  const velocityField = () => (
    <Box p={0} pt={1} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <VelocityField
        labelWidth={LAB_WIDTH}
        setRedshift={setRedshift}
        setVel={setVel}
        setVelType={setVelType}
        setVelUnit={setVelUnit}
        redshift={target?.redshift}
        vel={target?.vel}
        velType={target?.velType}
        velUnit={target?.velUnit}
        velFocus={() => helpComponent(t('velocity.help' + target?.velType))}
        // velTypeFocus={() => helpComponent('')}   TODO : Need to find out why this is not working great
        velUnitFocus={() => helpComponent(t('velocity.help' + target?.velType))}
      />
    </Box>
  );

  const referenceFrameField = () => (
    <Box p={0} pt={2} sx={{ height: WRAPPER_HEIGHT, width: WRAPPER_WIDTH }}>
      <ReferenceFrameField
        labelWidth={LAB_WIDTH}
        onFocus={() => helpComponent(t('referenceFrame.help'))}
        setValue={setReferenceFrame}
        value={target?.referenceFrame}
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
        <Grid
          container
          direction="column"
          alignItems="stretch"
          justifyContent="flex-start"
          spacing={1}
        >
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
