import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import React from 'react';
import { REFERENCE_COORDINATE_OPTIONS } from '@utils/constants.ts';

interface ReferenceCoordinatesFieldProps {
  setValue?: Function,
  value: number,
  valueFocus?: Function,
  disabled?: boolean
}

export default function ReferenceCoordinatesField({
                                                    setValue,
                                                    value,
                                                    valueFocus,
                                                    disabled
                                                  }: ReferenceCoordinatesFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'referenceCoordinates';

  const ReferenceCoordinatesValueField = () => {

    return (
      <Box pt={1}>
        <DropDown
          options={REFERENCE_COORDINATE_OPTIONS}
          required
          label={t(FIELD + '.label')}
          testId={FIELD + 'Type'}
          value={value}
          setValue={setValue}
          onFocus={valueFocus}
          disabled={disabled}
          toolTip={disabled ? t(FIELD + '.tooltip'): undefined}
        />
      </Box>
    );
  };

  return (
    <Box pb={0} pt={0} sx={{ width: '100%' }}>
      {ReferenceCoordinatesValueField()}
    </Box>
  );
}
