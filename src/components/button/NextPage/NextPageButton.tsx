'useClient';

import React from 'react';
import { Button, ButtonColorTypes, ButtonVariantTypes } from '@ska-telescope/ska-gui-components';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { PAGES } from '../../../utils/constants';

interface NextPageProps {
  label?: string;
  page?: number;
  func?: Function;
}

export default function NextPageButton({ label = '', page = 0, func = null }: NextPageProps) {
  const ClickFunction = () => {
    func(page === PAGES.length ? 0 : page + 1);
  };

  return (
    <Button
      ariaDescription={`${label}Button`}
      color={ButtonColorTypes.Secondary}
      icon={<ArrowForwardIosIcon />}
      label={label}
      onClick={ClickFunction}
      testId={`${label}Button`}
      variant={ButtonVariantTypes.Contained}
    />
  );
}
