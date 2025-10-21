import React from 'react';
import { Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ExtendedStrikethroughLabelBehindTextProps {
  labelText: string;
}

const GroupLabel: React.FC<ExtendedStrikethroughLabelBehindTextProps> = ({ labelText }) => {
  const theme = useTheme();
  const clearColor = theme.palette.secondary.contrastText;
  const darkColor = theme.palette.primary.light;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
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
          right: 'calc(100% - 50%)',
          height: '1px',
          backgroundColor: darkColor,
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
          backgroundColor: darkColor,
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
          backgroundColor: darkColor,
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
          backgroundColor: darkColor,
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
          backgroundColor: clearColor,
          color: darkColor,
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
