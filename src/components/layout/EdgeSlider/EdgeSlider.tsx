import { useState } from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';

const PANEL_WIDTH = 300;
const TAB_WIDTH = 40;

const Container = styled(Box)({
  position: 'fixed',
  top: '85px', // space for top nav
  bottom: '120px', // space for footer
  right: 0,
  zIndex: 1300
});

interface EdgeSliderProps {
  helperText: string;
}

export default function EdgeSlider({
  helperText = 'Helper text will be shown here'
}: EdgeSliderProps) {
  const [expanded, setExpanded] = useState(false);

  const togglePanel = () => {
    setExpanded(prev => !prev);
  };

  const theme = useTheme();

  const Panel = styled(Paper)<{ expanded: boolean }>(({ expanded }) => ({
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
    backgroundColor: '#fff',
    color: '#000',
    borderLeft: `4px solid ${theme.palette.secondary.main}`,
    borderRadius: '4px 0 0 4px'
  }));

  return (
    <Container>
      <Panel expanded={expanded} onClick={togglePanel}>
        <Box
          sx={{
            width: TAB_WIDTH,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: `1px solid #ddd`
          }}
        >
          <Typography sx={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
            HELP
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
            <Typography align={'left'}>{helperText}</Typography>
          </Box>
        )}
      </Panel>
    </Container>
  );
}
