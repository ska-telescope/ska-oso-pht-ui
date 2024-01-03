import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import { VisibilityRounded } from '@mui/icons-material';

export default function ViewProposalButton () {  
  const navigate = useNavigate();
    
    const clickFunction = () => {
      navigate('/proposal');
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
