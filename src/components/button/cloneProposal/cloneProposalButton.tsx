import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FileCopyRounded } from '@mui/icons-material';

export default function CloneProposalButton () {
    
    const clickFunction = () => {
      // TODO : Need to add content
    };
  
    return (
      <Tooltip title="Clone Proposal" arrow>
        <IconButton
          aria-label="clone"
          onClick={clickFunction}
          style={{ cursor: "pointer" }}
        >
          <FileCopyRounded />
        </IconButton>
      </Tooltip>
    );
  }