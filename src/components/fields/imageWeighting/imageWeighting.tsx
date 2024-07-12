import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION, OBSERVATION } from '../../../utils/constants';

interface ImageWeightingFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

export default function ImageWeightingField({
  disabled = false,
  labelWidth = 5,
  onFocus,
  setValue,
  value
}: ImageWeightingFieldProps) {
  const { t } = useTranslation('pht');
  const FIELD = 'imageWeighting';

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      <DropDown
        disabled={disabled}
        value={value}
        label={t('imageWeighting.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
        options={OBSERVATION.ImageWeighting}
        required
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
