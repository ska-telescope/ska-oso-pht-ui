import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry, Alert, AlertColorTypes } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import HelpPanel from '../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../services/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/ResolveButton';

export const HELP_NAME = ['NAME TITLE', 'NAME DESCRIPTION', ''];
export const HELP_RA = ['RIGHT ASCENSION TITLE', 'RIGHT ASCENSION DESCRIPTION', ''];
export const HELP_DEC = ['DECLINATION TITLE', 'DECLINATION DESCRIPTION', ''];
export const HELP_VEL = ['VELOCITY TITLE', 'VELOCITY DESCRIPTION', ''];

export default function AddTarget() {
  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [vel, setVel] = React.useState('');

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(HELP_NAME);
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
          <Grid container direction="row" alignItems="center" justifyContent="flex-start">
            <Grid item xs={10}>
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
                onFocus={() => helpComponent(HELP_NAME)}
              />
            </Grid>
            <Grid item xs={5}>
              <ResolveButton targetName={name} onClick={handleResolveClick} />
            </Grid>
          </Grid>
          <TextEntry
            label="Right Ascension"
            testId="ra"
            value={ra}
            setValue={setRA}
            onFocus={() => helpComponent(HELP_RA)}
          />
          <TextEntry
            label="Declination"
            testId="dec"
            value={dec}
            setValue={setDec}
            onFocus={() => helpComponent(HELP_DEC)}
          />
          <TextEntry
            label="Velocity / Redshift"
            testId="vel"
            value={vel}
            setValue={setVel}
            onFocus={() => helpComponent(HELP_VEL)}
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
