import React from 'react';
import { Download } from '@mui/icons-material';
import Icon from '../icon/Icon';

interface DownloadIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function DownloadIcon({
  disabled = false,
  onClick,
  toolTip = ''
}: DownloadIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<Download />}
      testId="downloadIcon"
      toolTip={toolTip}
    />
  );
}
