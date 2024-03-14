import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import VelocityField from '../../../../components/fields/velocity/Velocity';
import HelpPanel from '../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../services/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/ResolveButton';
import ReferenceFrameField from '../../../../components/fields/referenceFrame/ReferenceFrame';

export default function AddTarget() {
  const { t } = useTranslation('pht');
  const LAB_WIDTH = 5;

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [referenceFrame, setReferenceFrame] = React.useState('');
  const [vel, setVel] = React.useState('');
  const [velUnit, setVelUnit] = React.useState(0);
  const [velType, setVelType] = React.useState(0);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(t('name.help'));
  }, []);

  const disabled = () => !!(!name.length || !ra.length || !dec.length || !vel.length);

  const formValues = {
    name: {
      value: name,
      setValue: setName
    },
    ra: {
      value: ra,
      setValue: setRA
    },
    dec: {
      value: dec,
      setValue: setDec
    },
    vel: {
      vel,
      setValue: setVel
    }
  };

  const AddTheTarget = () => {
    const highestId = getProposal().targets.reduce(
      (acc, target) => (target.id > acc ? target.id : acc),
      0
    );
    const velocityUnits = t('velocity.unit.' + velUnit.toString());
    const newTarget = {
      dec,
      decUnit: '',
      id: highestId + 1,
      name,
      ra,
      raUnit: '',
      referenceFrame,
      vel,
      velUnit: velocityUnits
    };
    setProposal({ ...getProposal(), targets: [...getProposal().targets, newTarget] });
  };

  function clearForm() {
    formValues.name.setValue('');
    formValues.ra.setValue('');
    formValues.dec.setValue('');
    formValues.vel.setValue('');
  }

  const clickFunction = () => {
    AddTheTarget();
    clearForm();
  };

  const handleResolveClick = response => {
    if (response && !response.error) {
      const values = response.split(' ');
      setRA(values[0]);
      setDec(values[1]);
      setNameFieldError('');
    } else {
      setNameFieldError(response.error);
    }
  };

  const nameField = () => {
    return (
      <Box p={1} sx={{ width: '100%' }}>
        <TextEntry
          label={t('name.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          testId="name"
          value={name}
          setValue={setName}
          onFocus={() => helpComponent(t('name.help'))}
          errorText={nameFieldError}
        />
      </Box>
    );
  };

  const raField = () => {
    return (
      <Box p={1} sx={{ width: '100%' }}>
        <TextEntry
          label={t('rightAscension.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          testId="ra"
          value={ra}
          setValue={setRA}
          onFocus={() => helpComponent(t('rightAscension.help'))}
        />
      </Box>
    );
  };

  const decField = () => {
    return (
      <Box p={1} pb={0} sx={{ width: '100%' }}>
        <TextEntry
          label={t('declination.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          testId="dec"
          value={dec}
          setValue={setDec}
          onFocus={() => helpComponent(t('declination.help'))}
        />
      </Box>
    );
  };

  return (
    <Grid
      p={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
    >
      <Grid item xs={6}>
        <Grid container direction="column" alignItems="stretch" justifyContent="flex-start">
          <Grid item xs={12}>
            {nameField()}
          </Grid>
          <Grid item xs={12}>
            {raField()}
          </Grid>
          <Grid item xs={12}>
            {decField()}
          </Grid>
          <Grid item xs={12}>
            <VelocityField
              labelWidth={LAB_WIDTH}
              setValue={setVel}
              setValueType={setVelType}
              setValueUnit={setVelUnit}
              value={vel}
              valueType={velType}
              valueUnit={velUnit}
              valueFocus={() => helpComponent(t('velocity.help'))}
              valueTypeFocus={() => helpComponent(t('velocity.help'))}
              valueUnitFocus={() => helpComponent(t('velocity.help'))}
            />
          </Grid>
          {velType === 0 && (
            <Grid item xs={12}>
              <ReferenceFrameField
                labelBold={true}
                labelPosition={LABEL_POSITION.START}
                labelWidth={LAB_WIDTH}
                onFocus={() => helpComponent(t('referenceFrame.help'))}
                setValue={setReferenceFrame}
                value={referenceFrame}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Box p={1}>
              <AddTargetButton disabled={disabled()} onClick={clickFunction} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}>
        <ResolveButton targetName={name} onClick={handleResolveClick} />
      </Grid>
      <Grid item xs={4}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
