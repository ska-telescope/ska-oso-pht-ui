import React from 'react';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import BaseButton from '../Base/Button';
import { Box } from '@mui/material';

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
  testId,
  toolTip
}: ResolveButtonProps) {
  return (
    <Box pb={1}>
      <BaseButton
        action={action}
        disabled={disabled}
        icon={<MyLocationIcon />}
        primary={primary}
        testId={testId}
        title={title}
        toolTip={toolTip}
      />
    </Box>
  );
}
