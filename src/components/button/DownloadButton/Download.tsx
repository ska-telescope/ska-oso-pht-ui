import React from 'react';
import { DownloadRounded } from '@mui/icons-material';
import BaseButton from '../Base/Button';

interface DownloadButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function DownloadButton({
  disabled = false,
  action,
  title = 'downloadBtn.label',
  primary = false,
  testId,
  toolTip
}: DownloadButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<DownloadRounded />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
