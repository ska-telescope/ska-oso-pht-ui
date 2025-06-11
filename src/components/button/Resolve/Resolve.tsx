import React from 'react';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { Box } from '@mui/material';
import { ButtonSizeTypes } from '@ska-telescope/ska-gui-components';
import BaseButton from '../Base/Button';

interface ResolveButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function ResolveButton({
  disabled = false,
  action,
  title = 'resolve.label',
  primary = false,
  testId = 'resolveButtonTestId',
  toolTip
}: ResolveButtonProps) {
  return (
    <Box pb={1}>
      <BaseButton
        action={action}
        disabled={disabled}
        icon={<MyLocationIcon />}
        primary={primary}
        size={ButtonSizeTypes.Small}
        testId={testId}
        title={title}
        toolTip={toolTip}
      />
    </Box>
  );
}
