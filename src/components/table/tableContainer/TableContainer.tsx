import { ReactNode } from 'react';
import { TableContainer as MuiTableContainer, Paper, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TableContainerProps {
  children: ReactNode;
}

export default function TableContainer({ children }: TableContainerProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        borderTop: '1px solid grey',
        borderColor: theme.palette.primary.light
      }}
    >
      <MuiTableContainer
        component={Paper}
        elevation={1}
        role="region"
        aria-label="Review data table with expandable details"
        data-testid="review-table"
      >
        {children}
      </MuiTableContainer>
    </Box>
  );
}
