import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, Box, Paper } from '@mui/material';
import { COLOR_PALETTES } from '@/utils/colors/colors';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface RankEntryFieldProps {
  setSelectedRank: Function;
  suggestedRank?: number;
  selectedRank: number;
  colorBlindness?: number;
  colorIndex?: number;
  isProgressive?: boolean;
}

export default function RankEntryField({
  setSelectedRank,
  suggestedRank = 0,
  selectedRank,
  colorBlindness = 0,
  colorIndex = 0,
  isProgressive = true
}: RankEntryFieldProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const [hoveredRank, setHoveredRank] = React.useState<number | null>(null);
  const validMaxRank = 9;
  const currentColors = COLOR_PALETTES[colorBlindness];

  // Use dropdown value instead of prop
  const numSegments = validMaxRank;
  const segmentAngle = 360 / numSegments;

  const handleRankSelect = (rank: number) => {
    setSelectedRank(rank);
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
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

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
    return theme.palette.getContrastText(color);
  };

  return (
    <>
      {/* Visual feedback */}
      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('rank.helper')}
        </Typography>
      </Box>

      {suggestedRank > 0 && (
        <Box pt={1} textAlign="center">
          <Typography variant="body2" component="p">
            {t('rank.selected')}:{' '}
            <Typography component="span" variant="body2" fontWeight="bold">
              {suggestedRank}
            </Typography>
          </Typography>
        </Box>
      )}

      <Box display="flex" flexDirection="column" alignItems="center">
        <Box position="relative">
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
            style={{ filter: theme.shadows[3] }}
            role="img"
            aria-label={`Interactive ranking selector from 0 to ${validMaxRank}`}
          >
            {Array.from({ length: numSegments }, (_, index) => {
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
                    tabIndex={0}
                    role="button"
                    aria-label={`Select rank ${rank}`}
                    aria-pressed={isSelected}
                    onMouseEnter={() => handleMouseEnter(rank)}
                    onMouseLeave={handleMouseLeave}
                  />
                  <text
                    x={
                      120 +
                      80 *
                        Math.cos((index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180))
                    }
                    y={
                      120 +
                      80 *
                        Math.sin((index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180))
                    }
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
              tabIndex={0}
              role="button"
              aria-label="Select rank 0"
              aria-pressed={selectedRank === 0}
              onMouseEnter={() => handleMouseEnter(0)}
              onMouseLeave={handleMouseLeave}
              data-testid="section0TestId"
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

        <Box textAlign="center">
          <Typography variant="h6" component="p">
            {t('rank.selected')}:{' '}
            <Typography component="span" variant="h4" fontWeight="bold">
              {selectedRank}
            </Typography>
          </Typography>
        </Box>

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
              {t('rank.label')} {hoveredRank !== null ? hoveredRank : selectedRank}:{' '}
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
                {t('rank.hovering')}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
}
