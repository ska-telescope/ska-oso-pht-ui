import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import React from 'react';
import { SSO_OPTIONS } from '@utils/constants.ts';

interface SolarSystemObjectFieldProps {
  setValue?: Function,
  value: string,
  valueFocus?: Function
}


export default function SolarSystemObjectField({
                                                    setValue,
                                                    value,
                                                    valueFocus,
                                                  }: SolarSystemObjectFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'solarSystemObject';

  const SolarSystemObjectValueField = () => {

    return (
      <Box pt={1}>
        <DropDown
          options={SSO_OPTIONS}
          required
          label={t('name.label')}
          testId={FIELD + 'Type'}
          value={value}
          setValue={setValue}
          onFocus={valueFocus}
        />
      </Box>
    );
  };

  return (
    <Box pb={0} pt={0} sx={{ width: '100%' }}>
      {SolarSystemObjectValueField()}
    </Box>
  );
}