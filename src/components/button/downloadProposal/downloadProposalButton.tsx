import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormControlLabel, IconButton } from '@mui/material';
import { DownloadRounded } from '@mui/icons-material';
import { grey } from '@mui/material/colors';

export default function DownloadProposalButton (id) {
    const navigate = useNavigate();
    
    const clickFunction = () => {
      // eslint-disable-next-line no-console
      console.log('::: in clickFunction', id);
      // TODO - implement download proposal once API endpoint ready
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
            <DownloadRounded style={{ color: grey[500] }} />
          </IconButton>
        )}
      />
    );
  }