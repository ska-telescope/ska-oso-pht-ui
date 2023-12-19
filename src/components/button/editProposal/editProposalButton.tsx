import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { EditRounded } from '@mui/icons-material';

export default function EditProposalButton () {
    
    const clickFunction = () => {
      // TODO : Need to add content
    };
  
    return (
      <Tooltip title="Edit Proposal" arrow>
        <IconButton
          aria-label="edit"
          onClick={clickFunction}
          style={{ cursor: "pointer" }}
        >
          <EditRounded />
        </IconButton>
      </Tooltip>
    );
  }