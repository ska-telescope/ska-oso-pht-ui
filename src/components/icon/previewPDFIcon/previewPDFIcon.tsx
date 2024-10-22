import React from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Icon from '../icon/Icon';

interface PreviewPDFIconProps {
  disabled?: boolean;
  onClick?: Function;
  toolTip?: string;
}

export default function PreviewPDFIcon({
  disabled = false,
  onClick = null,
  toolTip = ''
}: PreviewPDFIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<PictureAsPdfIcon />}
      testId="tickIcon"
      toolTip={toolTip}
    />
  );
}
