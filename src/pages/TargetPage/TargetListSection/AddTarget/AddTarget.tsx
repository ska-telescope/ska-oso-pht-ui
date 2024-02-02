import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import HelpPanel from '../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../services/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/ResolveButton';

export default function AddTarget() {
  const { t } = useTranslation('pht');

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [vel, setVel] = React.useState('');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(t('help.name'));
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

  const [axiosResolveError, setAxiosResolveError] = React.useState('');

  const handleResolveClick = response => {
    if (response && !response.error) {
      // TODO: set coordinates in fields properly
      setRA(response);
    } else {
      setAxiosResolveError(response.error);
    }
  };

  return (
    <Grid container direction="row" alignItems="flex-start" justifyContent="space-evenly">
      <Grid item xs={6}>
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item xs={8}>
              {axiosResolveError ? (
                <Alert testId="alertErrorId" color={AlertColorTypes.Error}>
                  <Typography>{axiosResolveError}</Typography>
                </Alert>
              ) : null}
              <TextEntry
                label="Name"
                testId="name"
                value={name}
                setValue={setName}
                onFocus={() => helpComponent(t('help.name'))}
              />
            </Grid>
            <Grid item>
              <ResolveButton targetName={name} onClick={handleResolveClick} />
            </Grid>
          </Grid>
          <TextEntry
            label={t('label.rightAscension')}
            testId="ra"
            value={ra}
            setValue={setRA}
            onFocus={() => helpComponent(t('help.rightAscension'))}
          />
          <TextEntry
            label={t('label.declination')}
            testId="dec"
            value={dec}
            setValue={setDec}
            onFocus={() => helpComponent(t('help.declination'))}
          />
          <TextEntry
            label={t('label.velocity')}
            testId="vel"
            value={vel}
            setValue={setVel}
            onFocus={() => helpComponent(t('help.velocity'))}
          />
        </Grid>

        <Box p={1}>
          <AddTargetButton disabled={disabled()} onClick={clickFunction} />
        </Box>
      </Grid>
      <Grid item xs={5}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
