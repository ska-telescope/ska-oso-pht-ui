import React from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  ButtonColorTypes,
  ButtonSizeTypes,
  ButtonVariantTypes
} from '@ska-telescope/ska-gui-components';

export default function AddGroupObservationButton({ targetName, skyUnits, onClick }) {
  const { t } = useTranslation('pht');

  const ClickFunction = async () => {
    // TODO
    // onClick();
  };

  const title = t('groupObservations.label');

  return (
    <Button
      ariaDescription={`${title}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<AddIcon />}
      label={title}
      onClick={ClickFunction}
      size={ButtonSizeTypes.Small}
      testId={`${title}Button`}
      toolTip={title}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
