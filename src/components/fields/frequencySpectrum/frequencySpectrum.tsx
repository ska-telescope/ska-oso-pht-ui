import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface FrequencySpectrumProps {
  minFreq: number;
  maxFreq: number;
  centerFreq: number;
  bandWidth: number;
  minEdge: number;
  maxEdge: number;
  unit?: string;
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  minFreq,
  maxFreq,
  centerFreq,
  bandWidth,
  minEdge,
  maxEdge,
  unit = 'MHz'
}) => {
  const theme = useTheme();
  const totalWidth = maxFreq - minFreq;

  const bandStartFreq = centerFreq - bandWidth / 2;
  const bandEndFreq = centerFreq + bandWidth / 2;

  const bandOffsetPercent = ((bandStartFreq - minFreq) / totalWidth) * 100;
  const bandPercent = (bandWidth / totalWidth) * 100;
  const centerPercent = ((centerFreq - minFreq) / totalWidth) * 100;
  const minEdgePercent = ((minEdge - minFreq) / totalWidth) * 100;
  const maxEdgePercent = ((maxEdge - minFreq) / totalWidth) * 100;

  // Determine band color
  let bandColor = theme.palette.primary.light;
  if (bandStartFreq < minFreq || bandEndFreq > maxFreq) {
    bandColor = theme.palette.error.main;
  } else if (bandStartFreq < minEdge || bandEndFreq > maxEdge) {
    bandColor = theme.palette.warning.main;
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
      {/* Frequency Labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
        <Typography variant="body2">
          {minFreq} {unit}
        </Typography>
        <Typography variant="body2">
          {maxFreq} {unit}
        </Typography>
      </Box>

      {/* Spectrum Bar */}
      <Box
        sx={{
          position: 'relative',
          height: 24,
          backgroundColor: theme.palette.grey[200],
          borderRadius: 12,
          mt: 1,
          overflow: 'hidden'
        }}
      >
        {/* Highlighted Band */}
        <Box
          sx={{
            position: 'absolute',
            left: `${bandOffsetPercent}%`,
            width: `${bandPercent}%`,
            height: '100%',
            backgroundColor: bandColor
          }}
        />

        {/* Central Frequency Marker */}
        <Box
          sx={{
            position: 'absolute',
            left: `${centerPercent}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: theme.palette.secondary.main,
            transform: 'translateX(-1px)'
          }}
        />

        {/* Min Edge Marker */}
        <Box
          sx={{
            position: 'absolute',
            left: `${minEdgePercent}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: theme.palette.warning.light,
            transform: 'translateX(-1px)'
          }}
        />

        {/* Max Edge Marker */}
        <Box
          sx={{
            position: 'absolute',
            left: `${maxEdgePercent}%`,
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: theme.palette.warning.light,
            transform: 'translateX(-1px)'
          }}
        />
      </Box>

      {/* Band Info */}
      <Typography variant="body2" sx={{ mt: 1 }}>
        Center: {centerFreq} {unit} &nbsp; | &nbsp; Bandwidth: {bandWidth} {unit}
      </Typography>
    </Box>
  );
};

export default FrequencySpectrum;
