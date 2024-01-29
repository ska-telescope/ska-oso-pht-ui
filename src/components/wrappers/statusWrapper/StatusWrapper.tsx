import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { StatusIcon } from '@ska-telescope/ska-gui-components';
import { NAV, PAGES } from '../../../utils/constants';

interface StatusWrapperProps {
  level?: number;
  page: number;
}

export default function StatusWrapper({ level = 5, page }: StatusWrapperProps) {
  const navigate = useNavigate();
  const SIZE = 35;

  const ClickFunction = () => {
    navigate(NAV[page]);
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
