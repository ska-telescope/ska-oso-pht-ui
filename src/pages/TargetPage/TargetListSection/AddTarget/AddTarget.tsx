import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import VelocityField from '../../../../components/fields/velocity/Velocity';
import HelpPanel from '../../../../components/info/helpPanel/helpPanel';
import { Proposal } from '../../../../utils/types/proposal';
import ResolveButton from '../../../../components/button/Resolve/Resolve';
import ReferenceFrameField from '../../../../components/fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '../../../../components/fields/skyDirection/SkyDirection1';
import SkyDirection2 from '../../../../components/fields/skyDirection/SkyDirection2';
import AddButton from '../../../../components/button/Add/Add';
import GetCoordinates from '../../../../services/axios/getCoordinates/getCoordinates';

interface AddTargetProps {
  raType: number;
}

export default function AddTarget({ raType }: AddTargetProps) {
  const { t } = useTranslation('pht');
  const LAB_WIDTH = 5;
  const VELOCITY = 0;

  const { application, helpComponent, updateAppContent2 } = storageObject.useStore();
  const [nameFieldError, setNameFieldError] = React.useState('');
  const [name, setName] = React.useState('');
  const [ra, setRA] = React.useState('');
  const [dec, setDec] = React.useState('');
  const [referenceFrame, setReferenceFrame] = React.useState(0);
  const [vel, setVel] = React.useState('');
  const [velType, setVelType] = React.useState(0);
  const [velUnit, setVelUnit] = React.useState(0);

  const getProposal = () => application.content2 as Proposal;
  const setProposal = (proposal: Proposal) => updateAppContent2(proposal);

  React.useEffect(() => {
    helpComponent(t('name.help'));
  }, []);

  const disabled = () => !!(!name.length || !ra.length || !dec.length);

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
      dec,
      decUnit: raType.toString(),
      id: highestId + 1,
      name,
      latitude: null,
      longitude: null,
      ra,
      raUnit: raType.toString(),
      redshift: null,
      referenceFrame,
      vel,
      velUnit: velType.toString()
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

  const processCoordinatesResults = response => {
    if (response && !response.error) {
      const values = response.split(' ');
      setRA(values[1]);
      setDec(values[0]);
      if (values.length > 3 && velType === VELOCITY) {
        setVel(values[3]);
      } else if (values.length > 2) {
        setVel(values[2]);
      }
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
    <Grid p={1}>
      <TextEntry
        required
        label={t('name.label')}
        labelBold
        labelPosition={LABEL_POSITION.START}
        labelWidth={LAB_WIDTH}
        testId="name"
        value={name}
        setValue={setName}
        suffix={<ResolveButton action={() => getCoordinates(name, raType)} />}
        onFocus={() => helpComponent(t('name.help'))}
        errorText={nameFieldError}
      />
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
          <Grid item xs={12}>
            {nameField()}
          </Grid>
          <Grid item xs={12}>
            <SkyDirection1
              labelWidth={LAB_WIDTH}
              setValue={setRA}
              skyUnits={raType}
              value={ra}
              valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
            />
          </Grid>
          <Grid item xs={12}>
            <SkyDirection2
              labelWidth={LAB_WIDTH}
              setValue={setDec}
              skyUnits={raType}
              value={dec}
              valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
            />
          </Grid>
          <Grid item xs={12}>
            <VelocityField
              labelWidth={LAB_WIDTH}
              setValue={setVel}
              setValueType={setVelType}
              setValueUnit={setVelUnit}
              value={vel}
              valueType={velType}
              valueUnit={velUnit.toString()}
              valueFocus={() => helpComponent(t('velocity.help'))}
              valueTypeFocus={() => helpComponent(t('velocity.help'))}
              valueUnitFocus={() => helpComponent(t('velocity.help'))}
            />
          </Grid>
          {velType === VELOCITY && (
            <Grid item xs={12}>
              <ReferenceFrameField
                labelBold
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
              <AddButton
                action={clickFunction}
                disabled={disabled()}
                testId="addTargetButton"
                title="addTarget.label"
                toolTip="addTarget.toolTip"
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <HelpPanel />
      </Grid>
    </Grid>
  );
}
