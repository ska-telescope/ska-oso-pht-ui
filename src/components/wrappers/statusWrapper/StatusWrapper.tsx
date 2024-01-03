import React from 'react';
import { Grid, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { PAGES } from '../../../utils/constants';

interface StatusWrapperProps {
  level?: number;
  page: number;
  setPage?: Function;
}

export default function StatusWrapper({ level = 5, page, setPage }: StatusWrapperProps) {
  const SIZE = 35;

  const ClickFunction = () => {
    setPage(page);
  };

  const getLevel = () => (level > 5 ? 0 : level);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      onClick={ClickFunction}
    >
      <StatusIcon testId="statusId" icon level={getLevel()} size={SIZE} />
      <Typography variant="caption">{PAGES[page]}</Typography>
    </Grid>
  );
}
