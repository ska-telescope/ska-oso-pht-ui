'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { PAGES } from '../../../utils/constants';

interface PreviousPageProps {
  label?: string;
  page?: number;
  func: Function;
}

export default function PreviousPageButton({ label = '', page = 0, func }: PreviousPageProps) {
  const ClickFunction = () => {
    func(page === 0 ? PAGES.length - 1 : page - 1);
  };

  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Inherit}
      icon={<ArrowBackIosIcon />}
      label={label}
      onClick={ClickFunction}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
