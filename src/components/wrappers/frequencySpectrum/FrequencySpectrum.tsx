import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export interface FrequencySpectrumProps {
  minFreq: number;
  maxFreq: number;
  centerFreq: number;
  bandWidth: number;
  minEdge?: number;
  maxEdge?: number;
  unit?: string;
  bandColor?: string;
  bandColorContrast?: string;
  boxWidth?: string;
  actual?: boolean;
}

// Local copy of @ska-telescope/ska-gui-components' FrequencySpectrum. That component has no
// className/sx/slot passthrough for its internal elements (band, center marker, edge markers),
// so there's no way to adjust their styling (e.g. the center marker's fixed 2px width) without
// either patching the vendor package or owning the source here.
export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({
  minFreq,
  maxFreq,
  centerFreq,
  bandWidth,
  minEdge = minFreq,
  maxEdge = maxFreq,
  unit = 'MHz',
  bandColor = '',
  bandColorContrast = '',
  boxWidth = '400px',
  actual = false
}) => {
  const theme = useTheme();
  const totalWidth = maxFreq - minFreq;

  const bandStartFreq = centerFreq - bandWidth / 2;
  const bandEndFreq = centerFreq + bandWidth / 2;

  // Display bounds for min and max of band (rounded to 2dp)
  const displayGeometryMin = Number(bandStartFreq.toFixed(2));
  const displayGeometryMax = Number(bandEndFreq.toFixed(2));

  const bandOffsetPercent = ((bandStartFreq - minFreq) / totalWidth) * 100;
  const bandPercent = (bandWidth / totalWidth) * 100;
  const centerPercent = ((centerFreq - minFreq) / totalWidth) * 100;
  const minEdgePercent = ((minEdge - minFreq) / totalWidth) * 100;
  const maxEdgePercent = ((maxEdge - minFreq) / totalWidth) * 100;

  // Determine band color
  let usedColor = bandColor === '' ? theme.palette.primary.light : bandColor;
  let usedColorContrast =
    bandColorContrast === '' ? theme.palette.primary.contrastText : bandColorContrast;

  // Apply a tolerance to the boundary checks, so that a value that's genuinely exactly at the
  // boundary (but which may differ from min/max by a fraction of a Hz (due to rounding / fp arithmetic
  const BOUNDARY_TOLERANCE = 0.001;
  if (bandStartFreq < minFreq - BOUNDARY_TOLERANCE || bandEndFreq > maxFreq + BOUNDARY_TOLERANCE) {
    usedColor = theme.palette.error.main;
    usedColorContrast = theme.palette.error.contrastText;
  } else if (
    bandStartFreq < minEdge - BOUNDARY_TOLERANCE ||
    bandEndFreq > maxEdge + BOUNDARY_TOLERANCE
  ) {
    usedColor = theme.palette.warning.light;
    usedColorContrast = theme.palette.error.contrastText;
  }

  // Label width measurement (only used when actual === false)
  const labelRef = React.useRef<HTMLSpanElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!actual && labelRef.current) {
      setLabelWidth(labelRef.current.offsetWidth);
    }
  }, [centerFreq, unit, actual]);

  // --- ACTUAL MODE OVERRIDES ---
  // In actual mode, the band fills the entire bar
  const displayOffset = actual ? 0 : bandOffsetPercent;
  const displayWidth = actual ? 100 : bandPercent;

  return (
    <Box sx={{ width: boxWidth, textAlign: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {/* Min Frequency */}
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {actual ? `${displayGeometryMin} ${unit}` : `${minFreq} ${unit}`}
        </Typography>

        {/* Wrapper for label + bar */}
        <Box sx={{ flexGrow: 1, position: 'relative' }}>
          {/* CENTRAL LABEL ABOVE BAR (only when NOT actual) */}
          {!actual && (
            <Typography
              ref={labelRef}
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: '100%',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                color: usedColorContrast,
                left: `calc(${centerPercent}% - ${labelWidth / 2}px)`
              }}
            >
              {centerFreq} {unit}
            </Typography>
          )}

          {/* Spectrum Bar */}
          <Box
            sx={{
              position: 'relative',
              height: 48,
              backgroundColor: theme.palette.divider,
              overflow: 'hidden',
              borderTopLeftRadius: minEdge !== minFreq ? 24 : 0,
              borderBottomLeftRadius: minEdge !== minFreq ? 24 : 0,
              borderTopRightRadius: maxEdge !== maxFreq ? 24 : 0,
              borderBottomRightRadius: maxEdge !== maxFreq ? 24 : 0
            }}
          >
            {/* Highlighted Band */}
            <Box
              data-testid="frequencySpectrum-highlighted-band"
              sx={
                actual
                  ? {
                      position: 'absolute',
                      left: `${displayOffset}%`,
                      width: `${displayWidth}%`,
                      height: '100%',
                      backgroundColor: usedColor
                    }
                  : {
                      position: 'absolute',
                      // Positioned by its center (like the marker) rather than its left edge, so
                      // it stays centered on centerFreq
                      left: `${centerPercent}%`,
                      width: `${displayWidth}%`,
                      minWidth: '3px',
                      height: '100%',
                      backgroundColor: usedColor,
                      transform: 'translateX(-50%)'
                    }
              }
            />

            {/* CENTRAL MARKER (only when NOT actual) */}
            {!actual && (
              <Box
                data-testid="frequencySpectrum-center-marker"
                sx={{
                  position: 'absolute',
                  left: `${centerPercent}%`,
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: 'black',
                  transform: 'translateX(-0.5px)'
                }}
              />
            )}

            {/* EDGE MARKERS (only when NOT actual) */}
            {!actual && minEdge !== minFreq && (
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
            )}

            {!actual && maxEdge !== maxFreq && (
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
            )}

            {/* CENTRAL VALUE BOX (only when actual === true) */}
            {actual && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  left: `${centerPercent}%`,
                  backgroundColor: 'transparent',
                  color: usedColorContrast,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}
              >
                {centerFreq} {unit}
              </Box>
            )}
          </Box>
        </Box>

        {/* Max Frequency */}
        <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
          {actual ? `${displayGeometryMax} ${unit}` : `${maxFreq} ${unit}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default FrequencySpectrum;
