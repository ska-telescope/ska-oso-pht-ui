import React from 'react';
import { Typography, Box } from '@mui/material';

interface ExtendedStrikethroughLabelBehindTextProps {
  labelText: string;
}

const GroupLabel: React.FC<ExtendedStrikethroughLabelBehindTextProps> = ({ labelText }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto'
      }}
    >
      {/* Left line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 'calc(100% - 50%)', // Balanced line
          height: '1px',
          backgroundColor: 'black',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      />

      {/* Right line */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 'calc(100% - 50%)', // Balanced line
          right: 0,
          height: '1px',
          backgroundColor: 'black',
          transform: 'translateY(-50%)',
          zIndex: 1
        }}
      />

      {/* Left bullet */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '12px',
          height: '12px',
          backgroundColor: 'black',
          borderRadius: '50%',
          zIndex: 2
        }}
      />

      {/* Right bullet */}
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '12px',
          height: '12px',
          backgroundColor: 'black',
          borderRadius: '50%',
          zIndex: 2
        }}
      />

      {/* Centered text */}
      <Typography
        component="span"
        sx={{
          px: 2,
          zIndex: 2,
          backgroundColor: 'white',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center'
        }}
      >
        {labelText}
      </Typography>
    </Box>
  );
};

export default GroupLabel;
