import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';

export default function DeleteProposalButton () {
    
    const clickFunction = () => {
      // TODO : Need to add content
    };
  
    return (
      <Tooltip title="Delete Proposal" arrow>
        <IconButton
          aria-label="delete"
          onClick={clickFunction}
          style={{ cursor: "pointer" }}
        >
          <DeleteRounded />
        </IconButton>
      </Tooltip>
    );
  }