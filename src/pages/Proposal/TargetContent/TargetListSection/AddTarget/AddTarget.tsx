import { Box, Grid } from '@mui/material';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import React from 'react';
import AddTargetButton from '../../../../../components/button/AddTarget/AddTargetButton';
import InfoPanel from '../../../../../components/infoPanel/infoPanel';
import { Help } from '../../../../../services/types/help';
import { Proposal } from '../../../../../services/types/proposal';

export const HELP_NAME = {
  title: 'NAME TITLE',
  description: 'NAME DESCRIPTION',
  additional: ''
};
export const HELP_RA = {
  title: 'RIGHT ASCENSION TITLE',
  description: 'RIGHT ASCENSION DESCRIPTION',
  additional: ''
};
export const HELP_DEC = {
  title: 'DECLINATION TITLE',
  description: 'DECLINATION DESCRIPTION',
  additional: ''
};
export const HELP_VEL = {
  title: 'VELOCITY TITLE',
  description: 'VELOCITY DESCRIPTION',
  additional: ''
};

interface AddTargetProps {
  help: Help;
  proposal: Proposal;
  setHelp: Function;
  setProposal: Function;
}

export default function AddTarget({ help, proposal, setHelp, setProposal }: AddTargetProps) {
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [vel, setVel] = React.useState('');

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
      action: null,
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
            onFocus={() => setHelp(HELP_NAME)}
          />
          <TextEntry
            label="Right Ascension"
            testId="ra"
            value={ra}
            setValue={setRA}
            onFocus={() => setHelp(HELP_RA)}
          />
          <TextEntry
            label="Declination"
            testId="dec"
            value={dec}
            setValue={setDec}
            onFocus={() => setHelp(HELP_DEC)}
          />
          <TextEntry
            label="Velocity / Redshift"
            testId="vel"
            value={vel}
            setValue={setVel}
            onFocus={() => setHelp(HELP_VEL)}
          />
        </Grid>

        <Box p={1}>
          <AddTargetButton disabled={disabled()} onClick={clickFunction} />
        </Box>
      </Grid>
      <Grid item xs={5}>
        <InfoPanel title={help.title} description={help.description} additional={help.additional} />
      </Grid>
    </Grid>
  );
}
