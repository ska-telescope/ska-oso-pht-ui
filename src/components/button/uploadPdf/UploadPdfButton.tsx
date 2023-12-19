import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function UploadPdfButton() {
  const title = 'Supporting PDF';

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<UploadFileIcon />}
      label={title}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
      toolTip="Eventually this will the allow the user to upload a number of PDFs. Finalized usage to be completed"
    />
  );
}
