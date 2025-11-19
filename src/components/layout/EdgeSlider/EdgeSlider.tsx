import React from 'react';
import { Paper, Box, Stack, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

const PANEL_WIDTH = 300;
const TAB_WIDTH = 40;
const CONTAINER_SPACER_TOP = 240;
const CONTAINER_SPACER_BOTTOM = 200;
const GAP = 2;

export default function EdgeSlider() {
  const [expanded, setExpanded] = React.useState(false);
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { help } = storageObject.useStore();
  const theHelp = getHelp();
  const theLink = getLink();

  const togglePanel = () => {
    setExpanded(prev => !prev);
  };

  function getHelp(): string {
    return help && help?.component ? (help?.component as string) : '';
  }

  function getLink(): string {
    const url = help && help?.contentURL ? (help?.contentURL as string) : '';
    try {
      new URL(url); // Validate URL
      return url;
    } catch {
      return '#'; // Fallback if invalid
    }
  }

  const Container = styled(Box)({
    position: 'fixed',
    top: CONTAINER_SPACER_TOP,
    bottom: CONTAINER_SPACER_BOTTOM,
    right: 0,
    zIndex: 1300
  });

  // ✅ Prevent `expanded` from leaking to DOM
  const Panel = styled(Paper, {
    shouldForwardProp: prop => prop !== 'expanded'
  })<{ expanded: boolean }>(({ expanded, theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    transform: expanded ? 'translateX(0)' : `translateX(${PANEL_WIDTH - TAB_WIDTH}px)`,
    transition: 'transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)', // smoother easing
    willChange: 'transform', // GPU acceleration hint
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
              textOrientation: 'mixed'
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
            <Stack spacing={GAP}>
              <Typography align="left">{theHelp}</Typography>
              <Typography align="left">
                <a
                  href={theLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={theLink}
                  style={{
                    color: theme.palette.secondary.main,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'inline-block',
                    maxWidth: '100%'
                  }}
                >
                  {t('helpText.urlLabel')}
                </a>
              </Typography>
            </Stack>
          </Box>
        )}
      </Panel>
    </Container>
  );
}
