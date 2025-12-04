import { ReactNode } from 'react';
import { TableContainer as MuiTableContainer, Paper, Box } from '@mui/material';

interface TableContainerProps {
  children: ReactNode;
}

export default function TableContainer({ children }: TableContainerProps) {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
