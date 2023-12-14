/* eslint-disable @typescript-eslint/ban-types */

'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalculateIcon from '@mui/icons-material/Calculate';

interface InfoPanelProps {
  title: string;
  description: string;
  additional?: string;
  sensCalc?: Boolean;
  maxWidth?: number;
}

export default function InfoPanel({
  title,
  description,
  additional = '',
  sensCalc = false,
  maxWidth = 400
}: InfoPanelProps) {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCalcClick = () => {
    // TODO
  };

  const getIcon = () => {
    if (additional) {
      return <MoreVertIcon onClick={handleExpandClick} />;
    }
    return sensCalc ? <CalculateIcon onClick={handleCalcClick} /> : null;
  };

  return (
    <Card variant="outlined" sx={{ maxWidth }}>
      <CardHeader
        title={<Typography variant="body2">{title}</Typography>}
        action={getIcon() !== null && <IconButton aria-label="settings">{getIcon()}</IconButton>}
      />
      <CardContent>
        <Typography variant="caption">{description}</Typography>
      </CardContent>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="caption">{additional}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
