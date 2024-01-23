import React from 'react';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../../components/button/AddTarget/AddTargetButton';
import HelpPanel from '../../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../../services/types/proposal';
import { DEFAULT_HELP } from '../../../../../utils/constants';
import Resolve from '../../../../../components/button/Resolve/Resolve';

export const HELP_NAME = ['NAME TITLE', 'NAME DESCRIPTION', ''];
export const HELP_RA = ['RIGHT ASCENSION TITLE', 'RIGHT ASCENSION DESCRIPTION', ''];
export const HELP_DEC = ['DECLINATION TITLE', 'DECLINATION DESCRIPTION', ''];
export const HELP_VEL = ['VELOCITY TITLE', 'VELOCITY DESCRIPTION', ''];

interface AddTargetProps {
  proposal: Proposal;
  setProposal: Function;
}

export default function AddTarget({ proposal, setProposal }: AddTargetProps) {
  const { helpContent } = storageObject.useStore();
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [vel, setVel] = React.useState('');

  React.useEffect(() => {
    helpContent(DEFAULT_HELP);
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
    const highestId = proposal.targets.reduce(
      (acc, target) => (target.id > acc ? target.id : acc),
      0
    );
    const newTarget = {
      id: highestId + 1,
      actions: null,
      name,
      ra,
      dec,
      vel
    };
    setProposal({ ...proposal, targets: [...proposal.targets, newTarget] });
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

  return (
    <Grid container direction="row" alignItems="center" justifyContent="space-evenly">
      <Grid item xs={6}>
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
          <TextEntry
            label="Name"
            testId="name"
            value={name}
            setValue={setName}
            onFocus={() => helpContent(HELP_NAME)}
          />
          <Resolve />
          <TextEntry
            label="Right Ascension"
            testId="ra"
            value={ra}
            setValue={setRA}
            onFocus={() => helpContent(HELP_RA)}
          />
          <TextEntry
            label="Declination"
            testId="dec"
            value={dec}
            setValue={setDec}
            onFocus={() => helpContent(HELP_DEC)}
          />
          <TextEntry
            label="Velocity / Redshift"
            testId="vel"
            value={vel}
            setValue={setVel}
            onFocus={() => helpContent(HELP_VEL)}
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
