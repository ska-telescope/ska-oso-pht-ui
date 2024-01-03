import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DownloadRounded } from '@mui/icons-material';

export default function DownloadProposalButton() {
  const clickFunction = () => {
    // TODO : Need to add content
  };

  return (
    <Tooltip title="Downlaod Proposal" arrow>
      <IconButton aria-label="download" onClick={clickFunction} style={{ cursor: 'pointer' }}>
        <DownloadRounded />
      </IconButton>
    </Tooltip>
  );
}
