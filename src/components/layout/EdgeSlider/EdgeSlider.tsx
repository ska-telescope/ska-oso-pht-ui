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
  const hasLink = help?.componentURL?.length > 1;

  const togglePanel = () => {
    setExpanded(prev => !prev);
  };

  function getHelp(): string {
    return help?.component ? (help.component as string) : '';
  }

  function getLink(): string {
    const url = help?.componentURL ? (help.componentURL as string) : '';
    try {
      new URL(url);
      return url;
    } catch {
      return '#';
    }
  }

  const Container = styled(Box)({
    position: 'fixed',
    top: CONTAINER_SPACER_TOP,
    bottom: CONTAINER_SPACER_BOTTOM,
    right: 0,
    zIndex: 1300
  });

  const Panel = styled(Paper, {
    shouldForwardProp: prop => prop !== 'expanded'
  })<{ expanded: boolean }>(({ expanded, theme }) => ({
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    transform: expanded ? 'translateX(0)' : `translateX(${PANEL_WIDTH - TAB_WIDTH}px)`,
    transition: 'transform 5000ms cubic-bezier(0.1, 0.7, 0.1, 1)', // visibly slow & smooth
    willChange: 'transform',
    overflow: 'hidden',
    zIndex: 2,
    display: 'flex',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.contrastText,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    borderRadius: '40px 0 0 40px'
  }));

  const TabButton = styled('button')(({ theme }) => ({
    width: TAB_WIDTH,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRight: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px 0 0 4px',
    boxShadow: 'none',
    cursor: 'pointer',
    border: 'none',
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText
    }
  }));

  return (
    <Container>
      <Panel expanded={expanded}>
        <TabButton
          onClick={togglePanel}
          aria-expanded={expanded}
          aria-controls="edge-slider-content"
          data-testid="edge-slider-tab"
        >
          <HelpOutlineIcon fontSize="small" />
          <Typography
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            {t('helpText.label')}
          </Typography>
        </TabButton>

        {expanded && (
          <Box
            id="edge-slider-content"
            role="region"
            aria-label={t('helpText.label')}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              padding: '16px',
              overflowY: 'auto' // ✅ scroll if content too tall
            }}
          >
            <Stack spacing={GAP}>
              <Typography align="left">
                {theHelp.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line.trim()}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>
              {hasLink && (
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
              )}
            </Stack>
          </Box>
        )}
      </Panel>
    </Container>
  );
}
