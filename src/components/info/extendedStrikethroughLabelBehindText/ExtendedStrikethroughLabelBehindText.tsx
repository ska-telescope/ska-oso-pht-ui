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
        width: '100%',
        maxWidth: '400px',
        height: '3rem',
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Left line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 'calc(100% - 60%)',
          height: '1px',
          backgroundColor: 'black',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }}
      />

      {/* Right line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 'calc(100% - 30%)',
          right: 0,
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
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '15px',
          height: '15px',
          backgroundColor: 'black',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      {/* Right bullet */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '15px',
          height: '15px',
          backgroundColor: 'black',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      {/* Centered text */}
      <Typography
        component="span"
        sx={{
          px: 2,
          zIndex: 2,
          backgroundColor: 'white', // optional: ensures line doesn't show through translucent text
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        }}
      >
        {labelText}
      </Typography>
    </Box>
  );
};

export default ExtendedStrikethroughLabelBehindText;