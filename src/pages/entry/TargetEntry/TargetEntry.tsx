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
import { LAB_POSITION, RA_TYPE_EQUATORIAL, VELOCITY_TYPE } from '../../../utils/constants';

interface TargetEntryProps {
  id?: number;
  raType: number;
  setTarget: Function;
  target: Target;
}

export default function TargetEntry({ id = 0, raType, setTarget, target }: TargetEntryProps) {
  const { t } = useTranslation('pht');
  const LAB_WIDTH = 5;

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
    if (target && setTarget) {
      setTarget({ ...target, dec: inValue });
    }
  };

  const setName = (inValue: string) => {
    if (target && setTarget) {
      setTarget({ ...target, name: inValue });
    }
  };

  const setRA = (inValue: string) => {
    if (target && setTarget) {
      setTarget({ ...target, ra: inValue });
    }
  };

  const setRedshift = (inValue: string) => {
    if (target && setTarget) {
      setTarget({ ...target, redshift: inValue });
    }
  };

  const setReferenceFrame = (inValue: number) => {
    if (target && setTarget) {
      setTarget({ ...target, referenceFrame: inValue });
    }
  };

  const setVel = (inValue: string) => {
    if (target && setTarget) {
      setTarget({ ...target, vel: inValue });
    }
  };

  const setVelType = (inValue: number) => {
    if (target && setTarget) {
      setTarget({ ...target, velType: inValue });
    }
  };

  const setVelUnit = (inValue: number) => {
    if (target && setTarget) {
      setTarget({ ...target, velUnit: inValue });
    }
  };

  const disabled = () => !(target?.name?.length && target?.ra?.length && target?.dec?.length);

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

  function clearForm() {
    setTarget({ ...target, name: '', ra: '', dec: '', redshift: '', vel: '' });
  }

  const addButtonAction = () => {
    AddTheTarget();
    clearForm();
  };

  const processCoordinatesResults = response => {
    if (response && !response.error) {
      const values = response.split(' ');
      const redshift = values?.length > 2 && values[2] !== 'null' ? values[2] : '';
      const vel = values?.length > 3 && values[3] !== 'null' ? values[3] : '';
      setTarget({ ...target, dec: values[0], ra: values[1], redshift: redshift, vel: vel });
      setNameFieldError('');
    } else {
      setNameFieldError(t(response.error));
    }
  };

  const getCoordinates = async (targetName: string, skyUnits: number) => {
    const response = await GetCoordinates(targetName, skyUnits);
    processCoordinatesResults(response);
  };

  const nameField = () => (
    <Grid item p={1} xs={12}>
      <TextEntry
        required
        label={t('name.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={LAB_WIDTH}
        testId="name"
        value={target?.name}
        setValue={setName}
        suffix={
          <ResolveButton
            action={() => getCoordinates(target?.name, raType)}
            testId="resolveButton"
          />
        }
        onFocus={() => helpComponent(t('name.help'))}
        errorText={nameFieldError}
      />
    </Grid>
  );

  const skyDirection1Field = () => (
    <Grid item xs={12}>
      <SkyDirection1
        labelWidth={LAB_WIDTH}
        setValue={setRA}
        skyUnits={raType}
        value={target?.ra}
        valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
      />
    </Grid>
  );

  const skyDirection2Field = () => (
    <Grid item xs={12}>
      <SkyDirection2
        labelWidth={LAB_WIDTH}
        setValue={setDec}
        skyUnits={raType}
        value={target?.dec}
        valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
      />
    </Grid>
  );

  const velocityField = () => (
    <Grid item xs={12}>
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
        velFocus={() => helpComponent(t('velocity.help'))}
        velTypeFocus={() => helpComponent(t('velocity.help'))}
        velUnitFocus={() => helpComponent(t('velocity.help'))}
      />
    </Grid>
  );

  const referenceFrameField = () => (
    <Grid item xs={12}>
      {target?.velType === RA_TYPE_EQUATORIAL && (
        <ReferenceFrameField
          labelBold={true}
          labelPosition={LAB_POSITION}
          labelWidth={LAB_WIDTH}
          onFocus={() => helpComponent(t('referenceFrame.help'))}
          setValue={setReferenceFrame}
          value={target?.referenceFrame}
        />
      )}
    </Grid>
  );

  return (
    <Grid
      p={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-around"
    >
      <Grid item xs={7}>
        <Grid container direction="column" alignItems="stretch" justifyContent="flex-start">
          {nameField()}
          {skyDirection1Field()}
          {skyDirection2Field()}
          {velocityField()}
          {referenceFrameField()}
          {!id && (
            <Grid item xs={12}>
              <Box p={1}>
                <AddButton
                  action={addButtonAction}
                  disabled={disabled()}
                  testId="addTargetButton"
                  title="addTarget.label"
                  toolTip="addTarget.toolTip"
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
