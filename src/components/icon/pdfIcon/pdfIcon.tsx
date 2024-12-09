import React from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Icon from '../icon/Icon';

interface PDFIconProps {
  disabled?: boolean;
  onClick: Function;
  toolTip?: string;
}

export default function PDFIcon({ disabled = false, onClick, toolTip = '' }: PDFIconProps) {
  return (
    <Icon
      disabled={disabled}
      onClick={onClick}
      icon={<PictureAsPdfIcon />}
      testId="pdfIcon"
      toolTip={toolTip}
    />
  );
}
