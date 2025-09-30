import React from 'react';
import { Typography, Box } from '@mui/material';

interface ExtendedStrikethroughLabelProps {
  labelText: string;
}

const ExtendedStrikethroughLabel: React.FC<ExtendedStrikethroughLabelProps> = ({ labelText }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
        minWidth: '400px', // Increased width
        px: 2,
        textAlign: 'center'
      }}
    >
      <Typography component="span" sx={{ position: 'relative', zIndex: 2 }}>
        {labelText}
      </Typography>

      {/* Balanced strikethrough line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '1px',
          backgroundColor: 'black',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}
      />
    </Box>
  );
};

export default ExtendedStrikethroughLabel;
