import React from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import BaseButton from '../Base/Button';

interface PDFPreviewButtonProps {
  title?: string;
  action: string | Function;
  disabled?: boolean;
  primary?: boolean;
  testId?: string;
  toolTip?: string;
}

export default function PDFPreviewButton({
  disabled = false,
  action,
  title = 'pdfPreview.label',
  primary = false,
  testId = 'pdfPreviewButtonTestId',
  toolTip
}: PDFPreviewButtonProps) {
  return (
    <BaseButton
      action={action}
      disabled={disabled}
      icon={<PictureAsPdfIcon />}
      primary={primary}
      testId={testId}
      title={title}
      toolTip={toolTip}
    />
  );
}
