import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid, Typography } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import AddTargetButton from '../../../../components/button/AddTarget/AddTargetButton';
import HelpPanel from '../../../../components/helpPanel/helpPanel';
import { Proposal } from '../../../../services/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/ResolveButton';
import FieldWrapper from '../../../../components/wrappers/fieldWrapper/FieldWrapper';

export default function AddTarget() {
  const { t } = useTranslation('pht');

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

  return (
    <Grid container direction="row" alignItems="flex-start" justifyContent="space-evenly">
      <Grid item xs={6}>
        <Grid container direction="column" alignItems="center" justifyContent="space-evenly">
          <Grid container direction="row" alignItems="center" justifyContent="space-between">
            <Grid item xs={3}>
              <Typography variant="body2">
                <strong>{t('name.label')}</strong>
              </Typography>
            </Grid>
            <Grid item xs={5}>
              <TextEntry
                label=""
                testId="name"
                value={name}
                setValue={setName}
                onFocus={() => helpComponent(t('name.help'))}
                errorText={nameFieldError}
              />
            </Grid>
            <Grid item>
              <ResolveButton targetName={name} onClick={handleResolveClick} />
            </Grid>
          </Grid>
          <FieldWrapper label={t('rightAscension.label')}>
            <TextEntry
              label=""
              testId="ra"
              value={ra}
              setValue={setRA}
              onFocus={() => helpComponent(t('rightAscension.help'))}
            />
          </FieldWrapper>
          <FieldWrapper label={t('declination.label')}>
            <TextEntry
              label=""
              testId="dec"
              value={dec}
              setValue={setDec}
              onFocus={() => helpComponent(t('declination.help'))}
            />
          </FieldWrapper>
          <FieldWrapper label={t('velocity.label')}>
            <TextEntry
              label=""
              testId="vel"
              value={vel}
              setValue={setVel}
              onFocus={() => helpComponent(t('velocity.help'))}
            />
          </FieldWrapper>
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
