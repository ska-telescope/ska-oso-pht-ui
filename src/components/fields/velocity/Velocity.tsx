import React from 'react';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { VELOCITY_TYPE } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface VelocityFieldProps {
  setRedshift?: Function;
  setVel?: Function;
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
  setRedshift,
  setVel,
  setVelUnit,
  redshift,
  vel,
  velFocus,
  velType,
  velUnit,
  velUnitFocus
}: VelocityFieldProps) {
  const { t } = useScopedTranslation();

  React.useEffect(() => {
    if (setVel) setVel('');
  }, [velType]);

  const RedShiftValueField = () => {
    return (
      <TextEntry
        label={t('velocity.' + velType)}
        testId="redshiftValue"
        value={redshift}
        setValue={setRedshift}
        onFocus={velFocus}
      />
    );
  };

  const VelocityValueField = () => {
    return (
      <TextEntry
        label={t('velocity.' + velType)}
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
    <Box sx={{ height: '100%', width: '100%' }}>
      {velType === VELOCITY_TYPE.VELOCITY && VelocityValueField()}
      {velType === VELOCITY_TYPE.REDSHIFT && RedShiftValueField()}
    </Box>
  );
}
