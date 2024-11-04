import React from 'react';
import StatusIconDisplay from '../../icon/status/statusIcon';
import { STATUS_ERROR } from '../../../utils/constants';

export default function EmptyCell(error = '') {
  const SIZE = 20;

  return <StatusIconDisplay error={error} level={STATUS_ERROR} onClick={() => {}} size={SIZE} />;
}
