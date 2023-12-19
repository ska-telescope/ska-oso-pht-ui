import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControlLabel, IconButton } from '@mui/material';
import { DeleteRounded } from '@mui/icons-material';
import { grey } from '@mui/material/colors';

export default function DeleteProposalButton (id) {
    const navigate = useNavigate();
    
    const clickFunction = () => {
      // eslint-disable-next-line no-console
      console.log('::: in clickFunction', id);
      // TODO - implement delete proposal once API endpoint ready
      // navigate('/proposal');
    };
  
    return (
      <FormControlLabel
        label=''
        control={(
          <IconButton
            color="secondary"
            aria-label="clone"
            onClick={clickFunction}
            style={{ cursor: "pointer" }}
          >
            <DeleteRounded style={{ color: grey[500] }} />
          </IconButton>
        )}
      />
    );
  }