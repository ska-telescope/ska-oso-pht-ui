import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControlLabel, IconButton } from '@mui/material';
import { VisibilityRounded } from '@mui/icons-material';
import { grey } from '@mui/material/colors';

export default function ViewProposalButton (id) {
    const navigate = useNavigate();
    
    const clickFunction = () => {
      // eslint-disable-next-line no-console
      console.log('::: in clickFunction', id);
      // TODO - implement view proposal once API endpoint ready
      // navigate('/proposal');
    };
  
    return (
      <FormControlLabel
        label=''
        control={(
          <IconButton
            color="secondary"
            aria-label="view"
            onClick={clickFunction}
            style={{ cursor: "pointer" }}
          >
            <VisibilityRounded style={{ color: grey[500] }} />
          </IconButton>
        )}
      />
    );
  }