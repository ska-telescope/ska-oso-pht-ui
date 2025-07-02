import React from 'react';
import { useTranslation } from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import { Typography, Box, Chip, Paper } from '@mui/material';
import { COLOR_NAMES, COLOR_PALETTES } from '@/utils/accessibility/accessibility';

interface RankEntryFieldProps {
  setSelectedRank: Function;
  selectedRank: number;
  colorBlindness?: number;
  colorIndex?: number;
  isProgressive?: boolean;
}

export default function RankEntryField({
  setSelectedRank,
  selectedRank,
  colorBlindness = 0,
  colorIndex = 0,
  isProgressive = false
}: RankEntryFieldProps) {
  const { t } = useTranslation('pht');

  const theme = useTheme();
  const [hoveredRank, setHoveredRank] = React.useState<number | null>(null);

  const currentColors = COLOR_PALETTES[colorBlindness];
  const currentColorNames = COLOR_NAMES[colorBlindness];

  const handleRankSelect = (rank: number) => {
    setSelectedRank(rank);
  };

  const handleKeyDown = (event: React.KeyboardEvent, rank: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleRankSelect(rank);
    }
  };

  const handleMouseEnter = (rank: number) => {
    setHoveredRank(rank);
  };

  const handleMouseLeave = () => {
    setHoveredRank(null);
  };

  // Create SVG path for each donut segment
  const createSegmentPath = (index: number) => {
    const centerX = 120;
    const centerY = 120;
    const outerRadius = 100;
    const innerRadius = 60;
    const startAngle = (index * 45 - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * 45 - 90) * (Math.PI / 180);

    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  const getTextColor = (colorIndex: number) => {
    const color = currentColors[colorIndex];
    // Simple contrast calculation - in real implementation, you'd use a proper contrast function
    return theme.palette.getContrastText(color);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: theme.spacing(3),
        borderRadius: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create(['background-color'], {
          duration: theme.transitions.duration.standard
        })
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        {/* Visual feedback */}
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click on the center (0) or any segment (1-8) to set your ranking
          </Typography>
        </Box>

        {/* Keyboard instructions */}
        {/*} <Typography variant="caption" color="text.secondary" textAlign="center" maxWidth="400px">
          Use Tab to navigate between segments, then press Enter or Space to select
        </Typography> */}

        {colorIndex !== 0 && (
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: currentColors[colorIndex],
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[1]
              }}
            />
            <Chip
              label={`Single color mode: ${currentColorNames[colorIndex]}`}
              color="secondary"
              size="small"
              variant="outlined"
            />
          </Box>
        )}

        <Box position="relative">
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            style={{ filter: theme.shadows[3] }}
            role="img"
            aria-label={`Interactive ranking selector with 9 levels from 0 to 8`}
          >
            {/* Donut segments for ranks 1-8 */}
            {Array.from({ length: 8 }, (_, index) => {
              const rank = index + 1;
              const isSelected = selectedRank === rank;
              const isActive = !isProgressive || rank <= selectedRank;

              return (
                <g key={rank}>
                  <path
                    d={createSegmentPath(index)}
                    fill={
                      isActive
                        ? colorIndex === 0
                          ? currentColors[index]
                          : currentColors[colorIndex]
                        : theme.palette.background.default
                    }
                    stroke={
                      isProgressive
                        ? colorIndex === 0
                          ? currentColors[index]
                          : currentColors[colorIndex]
                        : theme.palette.divider
                    }
                    strokeWidth={isProgressive ? '3' : '2'}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      filter: isSelected
                        ? 'brightness(1.25) drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        : undefined,
                      outline: 'none'
                    }}
                    onClick={() => handleRankSelect(rank)}
                    onKeyDown={e => handleKeyDown(e, rank)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select rank ${rank}`}
                    aria-pressed={isSelected}
                    onMouseEnter={() => handleMouseEnter(rank)}
                    onMouseLeave={handleMouseLeave}
                  />
                  <text
                    x={120 + 80 * Math.cos((index * 45 + 22.5 - 90) * (Math.PI / 180))}
                    y={120 + 80 * Math.sin((index * 45 + 22.5 - 90) * (Math.PI / 180))}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontFamily: theme.typography.fontFamily,
                      fontSize: theme.typography.h6.fontSize,
                      fontWeight: theme.typography.fontWeightBold,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    fill={
                      isActive
                        ? getTextColor(colorIndex === 0 ? index : colorIndex)
                        : theme.palette.text.primary
                    }
                  >
                    {rank}
                  </text>
                </g>
              );
            })}

            {/* Center circle for rank 0 */}
            <circle
              cx="120"
              cy="120"
              r="55"
              fill={theme.palette.grey[selectedRank === 0 ? 800 : 700]}
              stroke={theme.palette.divider}
              strokeWidth="3"
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                filter:
                  selectedRank === 0
                    ? 'brightness(1.25) drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    : undefined,
                outline: 'none'
              }}
              onClick={() => handleRankSelect(0)}
              onKeyDown={e => handleKeyDown(e, 0)}
              tabIndex={0}
              role="button"
              aria-label="Select rank 0"
              aria-pressed={selectedRank === 0}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={handleMouseLeave}
            />
            <text
              x="120"
              y="120"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: theme.typography.fontFamily,
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.fontWeightBold,
                pointerEvents: 'none',
                userSelect: 'none'
              }}
              fill={theme.palette.common.white}
            >
              {selectedRank}
            </text>
          </svg>
        </Box>

        {/* Visual feedback */}
        <Box textAlign="center">
          <Typography variant="h6" component="p">
            Selected Rank:{' '}
            <Typography component="span" variant="h4" fontWeight="bold">
              {selectedRank}
            </Typography>
          </Typography>
        </Box>

        {/* Informational text area */}
        <Paper
          variant="outlined"
          sx={{
            width: '100%',
            maxWidth: 400,
            p: theme.spacing(2),
            mt: theme.spacing(3),
            backgroundColor: theme.palette.background.default
          }}
        >
          <Box textAlign="center">
            <Typography variant="h6" component="h3" gutterBottom>
              Rank {hoveredRank !== null ? hoveredRank : selectedRank}:{' '}
              {t('rank.' + (hoveredRank !== null ? hoveredRank : selectedRank) + '.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              {t('rank.' + (hoveredRank !== null ? hoveredRank : selectedRank) + '.description')}
            </Typography>
            {hoveredRank !== null && hoveredRank !== selectedRank && (
              <Typography
                variant="caption"
                color="info.main"
                sx={{ mt: 1, fontStyle: 'italic', display: 'block' }}
              >
                Hovering - Click to select this rank
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
