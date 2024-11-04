import React from 'react';
import StatusIconDisplay from '../../icon/status/statusIcon';
import { STATUS_ERROR } from '../../../utils/constants';

export default function EmptyCell() {
  const SIZE = 20;

  return <StatusIconDisplay error="" level={STATUS_ERROR} onClick={null} size={SIZE} />;
}
