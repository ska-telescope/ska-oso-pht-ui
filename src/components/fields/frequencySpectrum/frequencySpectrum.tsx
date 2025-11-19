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
  bandColor?: string;
  bandColorContrast?: string;
  boxWidth?: string;
}

const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  minFreq,
  maxFreq,
  centerFreq,
  bandWidth,
  minEdge,
  maxEdge,
  unit = 'MHz',
  bandColor = '',
  bandColorContrast = '',
  boxWidth = '200%' // TODO clarify why it was set at 200%
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
  let usedColor = bandColor === '' ? theme.palette.primary.light : bandColor;
  let usedColorContrast = bandColorContrast === '' ? theme.palette.divider : bandColorContrast;
  if (bandStartFreq < minFreq || bandEndFreq > maxFreq) {
    usedColor = theme.palette.error.main;
    usedColorContrast = theme.palette.error.contrastText;
  } else if (bandStartFreq < minEdge || bandEndFreq > maxEdge) {
    usedColor = theme.palette.warning.main;
    usedColorContrast = theme.palette.error.contrastText;
  }

  return (
    <Box sx={{ width: boxWidth, textAlign: 'center' }}>
      {/* Horizontal layout: minFreq | slider | maxFreq */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {/* Min Frequency */}
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {minFreq} {unit}
        </Typography>

        {/* Spectrum Bar */}
        <Box
          sx={{
            position: 'relative',
            flexGrow: 1,
            height: 48,
            backgroundColor: theme.palette.divider,
            borderRadius: 12,
            overflow: 'hidden'
          }}
        >
          {/* Highlighted Band */}
          <Box
            data-testid="frequencySpectrum-highlighted-band"
            sx={{
              position: 'absolute',
              left: `${bandOffsetPercent}%`,
              width: `${bandPercent}%`,
              height: '100%',
              backgroundColor: usedColor
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
              backgroundColor: usedColorContrast,
              transform: 'translateX(-1px)'
            }}
          />

          {/* Central Frequency Label - vertically centered */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              left: `calc(${centerPercent}% + 4px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              color: usedColorContrast
            }}
          >
            {centerFreq} {unit}
          </Typography>

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

        {/* Max Frequency */}
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {maxFreq} {unit}
        </Typography>
      </Box>
    </Box>
  );
};

export default FrequencySpectrum;
