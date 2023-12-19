import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { VisibilityRounded } from '@mui/icons-material';

export default function ViewProposalButton () {
    
    const clickFunction = () => {
      // TODO : Need to add content
    };
  
    return (
      <Tooltip title="View Proposal" arrow>
        <IconButton
          aria-label="view"
          onClick={clickFunction}
          style={{ cursor: "pointer" }}
        >
          <VisibilityRounded />
        </IconButton>
      </Tooltip>
    );
  }