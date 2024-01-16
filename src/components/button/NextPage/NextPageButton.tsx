'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { PAGES } from '../../../utils/constants';

interface NextPageProps {
  label?: string;
  page?: number;
  func?: Function;
  disabled?: boolean;
}

export default function NextPageButton({ label = '', page = 0, func = null, disabled }: NextPageProps) {
  const ClickFunction = () => {
    func(page === PAGES.length ? 0 : page + 1);
  };

  const getIcon = () => (page < 0 ? <AddIcon /> : <ArrowForwardIosIcon />);

  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Secondary}
      disabled={disabled}
      icon={getIcon()}
      label={label}
      onClick={ClickFunction}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
