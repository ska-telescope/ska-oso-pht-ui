import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface UploadPdfProps {
  func: Function;
}

export default function UploadPdfButton({ func }: UploadPdfProps) {
  const title = 'Supporting PDF';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<UploadFileIcon />}
      label={title}
      onClick={func}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
