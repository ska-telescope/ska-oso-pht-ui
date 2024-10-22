import React from 'react';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Icon from '../icon/Icon';

interface UploadIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function UploadIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: UploadIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<UploadFileIcon />}
      testId="tickIcon"
      toolTip={toolTip}
    />
  );
}
