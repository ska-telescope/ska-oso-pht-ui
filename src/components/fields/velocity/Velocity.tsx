import React from 'react';
import { DropDown, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { VELOCITY_TYPE } from '../../../utils/constants';
import { validateRadialMotion } from '@utils/validation/validation.tsx';
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
  velBlur?: Function;
  redshiftBlur?: Function;
  setErrorText?: (error: string) => void;
}

export default function VelocityField({
  setRedshift,
  setVel,
  setVelUnit,
  redshift,
  redshiftBlur,
  vel,
  velBlur,
  velFocus,
  velType,
  velUnit,
  velUnitFocus,

  setErrorText
}: VelocityFieldProps) {
  const { t } = useScopedTranslation();

  const rmValue = velType === VELOCITY_TYPE.VELOCITY ? vel : redshift;
  const rmFieldError = rmValue && validateRadialMotion(rmValue) === '0' ? t('velocity.error') : '';

  React.useEffect(() => {
    if (setErrorText) {
      setErrorText(rmFieldError);
    }
  }, [setErrorText, rmFieldError]);

  const renderRedShiftValueField = () => {
    return (
      <TextEntry
        errorText={rmFieldError}
        label={t('velocity.' + velType + '.label')}
        testId="redshiftValue"
        value={redshift}
        setValue={setRedshift}
        onFocus={velFocus}
        onBlur={redshiftBlur}
      />
    );
  };

  const renderVelocityValueField = () => {
    return (
      <TextEntry
        errorText={rmFieldError}
        label={t('velocity.' + velType + '.label')}
        testId="velocityValue"
        value={vel}
        setValue={setVel}
        suffix={renderVelocityUnitField()}
        onFocus={velFocus}
        onBlur={velBlur}
      />
    );
  };

  const renderVelocityUnitField = () => {
    const OPTIONS = [0, 1];

    const getOptions = () => {
      return OPTIONS.map((e) => ({ label: t('velocity.units.' + e), value: e }));
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
      {velType === VELOCITY_TYPE.VELOCITY && renderVelocityValueField()}
      {velType === VELOCITY_TYPE.REDSHIFT && renderRedShiftValueField()}
    </Box>
  );
}
