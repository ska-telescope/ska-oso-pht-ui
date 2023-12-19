'useClient';

import React from 'react';
import { Status } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';

interface StatusAvatarProps {
  level: number;
}

export default function StatusAvatar({ level }: StatusAvatarProps) {
  const SIZE = 23;
  const TEXT = ['Y', 'X', '!', '?', '', ''];

  const getLevel = () => (level > 5 ? 0 : level);

  return (
    <Box m={0.5} mt={1}>
      <Status testId="statusId" level={getLevel()} size={SIZE} text={TEXT[getLevel()]} />
    </Box>
  );
}
