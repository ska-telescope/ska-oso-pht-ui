import React from 'react';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box, Grid } from '@mui/material';
import { VELOCITY_TYPE } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface VelocityFieldProps {
  labelWidth?: number;
  setRedshift?: Function;
  setVel?: Function;
  setVelType?: Function;
  setVelUnit?: Function;
  redshift?: string;
  vel: string;
  velFocus?: Function;
  velType: number;
  velTypeFocus?: Function;
  velUnit: number;
  velUnitFocus?: Function;
}

export default function VelocityField({
  labelWidth = 5,
  setRedshift,
  setVel,
  setVelType,
  setVelUnit,
  redshift,
  vel,
  velFocus,
  velType,
  velTypeFocus,
  velUnit,
  velUnitFocus
}: VelocityFieldProps) {
  const { t } = useScopedTranslation();

  React.useEffect(() => {
    setVel('');
  }, [velType]);

  const RedShiftValueField = () => {
    return (
      <TextEntry
        label=""
        testId="redshiftValue"
        value={redshift}
        setValue={setRedshift}
        onFocus={velFocus}
      />
    );
  };

  const VelocityTypeField = () => {
    const getOptions = () => {
      return [VELOCITY_TYPE.VELOCITY, VELOCITY_TYPE.REDSHIFT].map(e => ({
        label: t('velocity.' + e),
        value: e
      }));
    };

    return (
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId="velocityType"
          value={velType}
          setValue={setVelType}
          disabled={getOptions().length < 2}
          label=""
          onFocus={velTypeFocus}
          required
        />
      </Box>
    );
  };

  const VelocityValueField = () => {
    return (
      <TextEntry
        label=""
        testId="velocityValue"
        value={vel}
        setValue={setVel}
        suffix={VelocityUnitField()}
        onFocus={velFocus}
      />
    );
  };

  const VelocityUnitField = () => {
    const OPTIONS = [0, 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t('velocity.units.' + e), value: e }));
    };

    return (
      <DropDown
        options={getOptions()}
        testId="velocityUnits"
        value={velUnit}
        setValue={setVelUnit}
        label=""
        onFocus={velUnitFocus}
      />
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid
        pb={1}
        spacing={0}
        container
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Grid size={{ xs: labelWidth }}>{velType !== null && VelocityTypeField()}</Grid>
        <Grid pt={1} size={{ xs: 12 - labelWidth }}>
          {velType === VELOCITY_TYPE.VELOCITY && VelocityValueField()}
          {velType === VELOCITY_TYPE.REDSHIFT && RedShiftValueField()}
        </Grid>
      </Grid>
    </Box>
  );
}
