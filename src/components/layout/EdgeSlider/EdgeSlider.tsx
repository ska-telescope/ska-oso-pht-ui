import { useState } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import React from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const PANEL_WIDTH = 300;
const TAB_WIDTH = 40;
const CONTAINER_SPACER = 250;

interface EdgeSliderProps {
  helperText: string;
}

export default function EdgeSlider({
  helperText = 'Helper text will be shown here'
}: EdgeSliderProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useScopedTranslation();
  const theme = useTheme();

  const togglePanel = () => {
    setExpanded(prev => !prev);
  };

  const Container = styled(Box)({
    position: 'fixed',
    top: CONTAINER_SPACER,
    bottom: CONTAINER_SPACER,
    right: 0,
    zIndex: 1300
  });

  const Panel = styled(Paper)<{ expanded: boolean }>(({ expanded, theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    transform: expanded ? 'translateX(0)' : `translateX(${PANEL_WIDTH - TAB_WIDTH}px)`,
    transition: 'transform 300ms ease-in-out',
    overflow: 'hidden',
    zIndex: 2,
    display: 'flex',
    cursor: 'pointer',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.contrastText,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    borderRadius: '40px 0 0 40px'
  }));

  return (
    <Container>
      <Panel expanded={expanded} onClick={togglePanel}>
        <Box
          sx={{
            width: TAB_WIDTH,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: '4px 0 0 4px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.secondary.contrastText
            }
          }}
        >
          <HelpOutlineIcon fontSize="small" />
          <Typography
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontWeight: 'bold'
            }}
          >
            {t('helpText.label')
              .split('\n')
              .map((line, index) => (
                <React.Fragment key={index}>
                  {line.trim()}
                  <br />
                </React.Fragment>
              ))}
          </Typography>
        </Box>

        {expanded && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <Typography align="left">{helperText}</Typography>
          </Box>
        )}
      </Panel>
    </Container>
  );
}
