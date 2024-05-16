import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import { DownloadRounded } from '@mui/icons-material';

interface DownloadButtonProps {
  disabled?: boolean;
  onClick: Function;
}
export default function DownloadButton({ disabled = false, onClick }: DownloadButtonProps) {
  const { t } = useTranslation('pht');

  const title = t('downloadBtn.label');

  const ClickFunction = () => {
    //TODO:
    onClick();
  };

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<DownloadRounded />}
      label={title}
      onClick={ClickFunction}
      disabled={disabled}
      testId={`${title}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
