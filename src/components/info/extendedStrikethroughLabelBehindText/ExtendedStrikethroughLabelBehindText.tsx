import React from 'react';
import { Typography, Box } from '@mui/material';

interface ExtendedStrikethroughLabelBehindTextProps {
  labelText: string;
}

const ExtendedStrikethroughLabelBehindText: React.FC<ExtendedStrikethroughLabelBehindTextProps> = ({ labelText }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-block',
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

      {/* Left bullet */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: -10,
          width: '15px',
          height: '15px',
          backgroundColor: 'black',
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      />

      {/* Right bullet */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '300px',
          width: '15px',
          height: '15px',
          backgroundColor: 'black',
          borderRadius: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

export default ExtendedStrikethroughLabelBehindText;