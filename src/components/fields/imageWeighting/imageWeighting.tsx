import React from 'react';
import { useTranslation } from 'react-i18next';
import { DropDown } from '@ska-telescope/ska-gui-components';
import { IMAGE_WEIGHTING, LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { Box } from '@mui/system';

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

  const options = () =>
    IMAGE_WEIGHTING.map(el => {
      return { label: t('imageWeighting.' + el.value), lookup: el.lookup, value: el.value };
    });

  return (
    <Box pt={1}>
      <DropDown
        disabled={disabled}
        value={value}
        label={t('imageWeighting.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
        options={options()}
        required
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
