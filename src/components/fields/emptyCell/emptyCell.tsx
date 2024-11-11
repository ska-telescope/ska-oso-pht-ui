import React from 'react';
import StatusIconDisplay from '../../icon/status/statusIcon';
import { STATUS_ERROR } from '../../../utils/constants';

export default function EmptyCell(error = '') {
  const SIZE = 20;

  return (
    <StatusIconDisplay
      ariaDescription=""
      ariaTitle=""
      level={STATUS_ERROR}
      onClick={null}
      size={SIZE}
      testId="emptyCell"
    />
  );
}
