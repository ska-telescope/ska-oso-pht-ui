import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import HelpPanel from '../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../services/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/ResolveButton';

export default function AddTarget() {
  const { t } = useTranslation('pht');
  const LAB_WIDTH = 6;

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [vel, setVel] = React.useState('');

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
    const newTarget = {
      id: highestId + 1,
      name,
      ra,
      dec,
      vel
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
      <Box p={1} sx={{ width: '100%' }}>
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

  const velField = () => {
    return (
      <Box p={1} sx={{ width: '100%' }}>
        <TextEntry
          label={t('velocity.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          testId="vel"
          value={vel}
          setValue={setVel}
          onFocus={() => helpComponent(t('velocity.help'))}
        />
      </Box>
    );
  };

  return (
    <Grid
      m={1}
      spacing={1}
      container
      direction="row"
      alignItems="flex-start"
      justifyContent="space-between"
    >
      <Grid item xs={5}>
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
            {velField()}
          </Grid>
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
      <Grid item xs={1}></Grid>
    </Grid>
  );
}
