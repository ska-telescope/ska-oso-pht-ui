import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { DownloadRounded } from '@mui/icons-material';

export default function DownloadButton() {
  const { t } = useTranslation('pht');

  const title = t('downloadBtn.label');

  const onClick = () => {
    // TODO
  };

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<DownloadRounded />}
      label={title}
      disabled
      onClick={onClick}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
