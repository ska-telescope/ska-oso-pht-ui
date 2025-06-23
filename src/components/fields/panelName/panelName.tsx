import React from 'react';
import { TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';

interface PanelNameFieldProps {
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  label?: string;
  testId: string;
  value: string;
  widthButton?: number;
  widthLabel?: number;
}

export default function PanelNameField({
  onFocus = null,
  label = '',
  required = true,
  setValue,
  testId,
  value,
  widthLabel = 6
}: PanelNameFieldProps) {
  return (
    <Box pt={1}>
      <TextEntry
        label={label}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        required={required}
        testId={testId}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
      />
    </Box>
  );
}
