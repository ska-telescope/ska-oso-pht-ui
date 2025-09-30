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
        minWidth: '200px',
        px: 2,
      }}
    >
      <Typography component="span" sx={{ position: 'relative', zIndex: 2 }}>
        {labelText}
      </Typography>
      {/* Strikethrough line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '-10px',
          right: '300px',
          height: '1px',
          backgroundColor: 'black',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default ExtendedStrikethroughLabel;