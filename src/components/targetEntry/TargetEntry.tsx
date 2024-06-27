import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Grid } from '@mui/material';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { LABEL_POSITION, TextEntry } from '@ska-telescope/ska-gui-components';
import { Proposal } from '../../utils/types/proposal';
import AddButton from '../button/Add/Add';
import ResolveButton from '../button/Resolve/Resolve';
import ReferenceFrameField from '../fields/referenceFrame/ReferenceFrame';
import SkyDirection1 from '../fields/skyDirection/SkyDirection1';
import SkyDirection2 from '../fields/skyDirection/SkyDirection2';
import VelocityField from '../fields/velocity/Velocity';
import HelpPanel from '../info/helpPanel/helpPanel';
import GetCoordinates from '../../services/axios/getCoordinates/getCoordinates';
import Target from '../../utils/types/target';
import { RA_TYPE_EQUATORIAL, RA_TYPE_GALACTIC } from '../../utils/constants';

interface TargetEntryProps {
  id?: any;
  raType: number;
  setTarget?: Function;
  target?: Target;
}

export default function TargetEntry({ id, raType, setTarget, target }: TargetEntryProps) {
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
      redshift: null,
      referenceFrame: target.referenceFrame,
      vel: target.vel,
      velType: target.velType,
      velUnit: target.velUnit
    };
    setProposal({ ...getProposal(), targets: [...getProposal().targets, newTarget] });
  };

  function clearForm() {
    setTarget({ ...target, name: '', ra: '', dec: '', vel: '' });
  }

  const addButtonAction = () => {
    AddTheTarget();
    clearForm();
  };

  const processCoordinatesResults = response => {
    if (response && !response.error) {
      const values = response.split(' ');
      const offset = values?.length > 3 && target?.velType === RA_TYPE_EQUATORIAL ? 3 : 2;
      const vel = values[offset] !== 'null' ? values[offset] : '';
      setTarget({ ...target, dec: values[0], ra: values[1], vel: vel });
      setNameFieldError('');
    } else {
      setNameFieldError(t(response.error));
    }
  };

  const getCoordinates = async (targetName: string, skyUnits: number) => {
    const response = await GetCoordinates(targetName, skyUnits);
    processCoordinatesResults(response);
  };

  const nameField = () => <Grid item p={1} xs={12}>
        <TextEntry
          required
          label={t('name.label')}
          labelBold
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          testId="name"
          value={target?.name}
          setValue={setName}
          suffix={<ResolveButton action={() => getCoordinates(target?.name, raType)} />}
          onFocus={() => helpComponent(t('name.help'))}
          errorText={nameFieldError}
        />
      </Grid>;

  const skyDirection1Field = () => <Grid item xs={12}>
        <SkyDirection1
          labelWidth={LAB_WIDTH}
          setValue={setRA}
          skyUnits={raType}
          value={target?.ra}
          valueFocus={() => helpComponent(t('skyDirection.help.1.value'))}
        />
      </Grid>;

  const skyDirection2Field = () => <Grid item xs={12}>
        <SkyDirection2
          labelWidth={LAB_WIDTH}
          setValue={setDec}
          skyUnits={raType}
          value={target?.dec}
          valueFocus={() => helpComponent(t('skyDirection.help.2.value'))}
        />
      </Grid>;

  const velocityField = () => <Grid item xs={12}>
        <VelocityField
          labelWidth={LAB_WIDTH}
          setValue={setVel}
          setValueType={setVelType}
          setValueUnit={setVelUnit}
          value={target?.vel}
          valueType={target?.velType}
          valueUnit={target?.velUnit}
          valueFocus={() => helpComponent(t('velocity.help'))}
          valueTypeFocus={() => helpComponent(t('velocity.help'))}
          valueUnitFocus={() => helpComponent(t('velocity.help'))}
        />
      </Grid>;

  const referenceFrameField = () => <Grid item xs={12}>
        <ReferenceFrameField
          labelBold={true}
          labelPosition={LABEL_POSITION.START}
          labelWidth={LAB_WIDTH}
          onFocus={() => helpComponent(t('referenceFrame.help'))}
          setValue={setReferenceFrame}
          value={target?.referenceFrame}
        />
      </Grid>;

  const emptyField = () => <Grid item p={4} xs={12} />;

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
          {target?.velType === RA_TYPE_EQUATORIAL && referenceFrameField()}
          {target?.velType === RA_TYPE_GALACTIC && emptyField()}
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