import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoCard, InfoCardColorTypes } from '@ska-telescope/ska-gui-components';

const ERROR_FONTSIZE = 20;

interface ErrorContentProps {
  msg: string;
}

export default function ErrorPanel({ msg }: ErrorContentProps) {
  const { t } = useTranslation('pht');
  return (
    <InfoCard
      color={InfoCardColorTypes.Error}
      fontSize={ERROR_FONTSIZE}
      message={t(msg)}
      showStatus
      testId="errorPanelTestId"
    />
  );
}
